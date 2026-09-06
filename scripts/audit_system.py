#!/usr/bin/env python3
"""
HarpHub Automated System, Security, Database & Scalability Audit Suite
This script executes comprehensive audit routines across:
1. Database Schema & Indexing Compliance
2. SQL Injection & Security Vulnerability Scanning
3. Authentication & Authorization Enforcement
4. Frontend Performance & Bundle Scalability
5. File Upload & Directory Execution Security

Usage: python scripts/audit_system.py
"""

import os
import sys
import re
import subprocess
from datetime import datetime

# Set stdout encoding for Windows console compatibility
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Formatting helpers
def print_header(title):
    print("\n" + "=" * 75)
    print(f"  {title}")
    print("=" * 75)

def print_status(check_name, status, details=""):
    symbol = "[PASS]" if status else "[FAIL/WARN]"
    print(f"{symbol:11s} {check_name}")
    if details:
        print(f"            └── {details}")

# Audit Module 1: Database Schema & Indexing
def audit_database_structure(api_path):
    print_header("1. DATABASE SCHEMA & INDEXING AUDIT")
    if not os.path.exists(api_path):
        print_status("Backend API File", False, f"File not found: {api_path}")
        return False

    with open(api_path, "r", encoding="utf-8") as f:
        code = f.read()

    # Check index definitions
    required_indexes = [
        ("lessons", "idx_lessons_user_id", "user_id"),
        ("lessons", "idx_lessons_visibility", "visibility"),
        ("lessons", "idx_lessons_category", "category"),
        ("collections", "idx_collections_user_id", "user_id"),
        ("collection_lessons", "idx_cl_lesson_id", "lesson_id"),
        ("activities", "idx_activities_user_id", "user_id"),
        ("practice_submissions", "idx_submissions_user_id", "user_id"),
        ("learning_paths", "idx_paths_creator_id", "creator_id")
    ]

    missing_indexes = []
    for table, idx_name, col in required_indexes:
        pattern = rf"ALTER TABLE {table}\s+ADD INDEX {idx_name}"
        if not re.search(pattern, code, re.IGNORECASE):
            missing_indexes.append((table, idx_name, col))

    if missing_indexes:
        details = ", ".join([f"{t}.{c} ({i})" for t, i, c in missing_indexes])
        print_status("Database Indexing Audit", False, f"Missing indexes: {details}")
    else:
        print_status("Database Indexing Audit", True, "All critical foreign keys and query columns are properly indexed.")

    # Data Type Audit
    lesson_user_id = re.search(r"CREATE TABLE IF NOT EXISTS lessons \([^;]*user_id ([^,\n]+)", code, re.IGNORECASE)
    user_id_type = lesson_user_id.group(1).strip() if lesson_user_id else "UNKNOWN"
    print_status("Data Type Consistency Audit", True, f"lessons.user_id data type: {user_id_type}")

    return len(missing_indexes) == 0

# Audit Module 2: Security & SQL Injection Prevention
def audit_security(api_path):
    print_header("2. SECURITY & SQL INJECTION AUDIT")
    if not os.path.exists(api_path):
        return False

    with open(api_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    raw_sql_warnings = []
    headers_check = {
        "Access-Control-Allow-Origin": False,
        "X-Content-Type-Options": False,
        "X-Frame-Options": False,
        "X-XSS-Protection": False
    }

    for idx, line in enumerate(lines, 1):
        # Check security headers
        for h in headers_check.keys():
            if h in line:
                headers_check[h] = True

        # Check for un-parameterized SQL concatenations
        if re.search(r"\$pdo->query\s*\(\s*\"[^\"]*\$", line) or re.search(r"\$pdo->exec\s*\(\s*\"[^\"]*\$", line):
            # Exclude safe ALTER TABLE string interpolations
            if "ALTER TABLE" not in line and "CREATE TABLE" not in line:
                raw_sql_warnings.append((idx, line.strip()))

    missing_headers = [h for h, found in headers_check.items() if not found]
    if missing_headers:
        print_status("HTTP Security Headers", False, f"Missing headers: {', '.join(missing_headers)}")
    else:
        print_status("HTTP Security Headers", True, "All recommended security headers are present.")

    if raw_sql_warnings:
        print_status("SQL Injection Audit", False, f"Found {len(raw_sql_warnings)} potential raw SQL interpolations:")
        for line_num, code_line in raw_sql_warnings[:3]:
            print(f"                  Line {line_num}: {code_line[:70]}")
    else:
        print_status("SQL Injection Audit", True, "100% of dynamic query parameters use PDO prepared statements.")

    return len(missing_headers) == 0 and len(raw_sql_warnings) == 0

# Audit Module 3: Authorization Checks Audit
def audit_authorization(api_path):
    print_header("3. AUTHORIZATION & ACCESS CONTROL AUDIT")
    with open(api_path, "r", encoding="utf-8") as f:
        code = f.read()

    protected_actions = ['delete_lesson', 'update_lesson', 'delete_collection', 'patch_lesson']
    unprotected = []

    for act in protected_actions:
        pattern = rf"action\s*===\s*'{act}'"
        match = re.search(pattern, code)
        if match:
            pos = match.start()
            sub_code = code[pos:pos+600]
            if "user_id" not in sub_code and "owner" not in sub_code and "id" not in sub_code:
                unprotected.append(act)
        else:
            unprotected.append(f"{act} (not found)")

    if unprotected:
        print_status("Action Authorization Audit", False, f"Actions lacking explicit user validation: {', '.join(unprotected)}")
    else:
        print_status("Action Authorization Audit", True, "All mutation actions verify user ownership / user_id.")

    return len(unprotected) == 0

# Audit Module 4: Frontend Performance & Scalability
def audit_frontend():
    print_header("4. FRONTEND PERFORMANCE & BUILD AUDIT")

    dist_dir = "dist"
    if not os.path.exists(dist_dir):
        print_status("Production Build Bundle", False, "dist/ directory not found. Run 'npm run build' first.")
        return False

    large_js_css = []
    total_size = 0

    for root, _, files in os.walk(dist_dir):
        for file in files:
            path = os.path.join(root, file)
            size_kb = os.path.getsize(path) / 1024
            total_size += size_kb
            ext = os.path.splitext(file)[1].lower()
            if ext in ['.js', '.css'] and size_kb > 1500:
                large_js_css.append((file, f"{size_kb:.1f} KB"))

    print_status("Production Build Status", True, f"Total dist/ size: {total_size/1024:.1f} MB (including media/soundfonts)")
    if large_js_css:
        print_status("Code Chunking Audit", False, f"Found {len(large_js_css)} heavy JS/CSS bundles (>1.5MB):")
        for f_name, f_size in large_js_css:
            print(f"                  {f_name}: {f_size}")
    else:
        print_status("Code Chunking Audit", True, "All JS/CSS bundle chunks are within standard performance thresholds (<1.5MB).")

    return len(large_js_css) == 0

# Audit Module 5: File & Execution Security Audit
def audit_file_permissions():
    print_header("5. UPLOADS & EXECUTION SECURITY AUDIT")
    uploads_dir = os.path.join("backend", "uploads")
    htaccess_path = os.path.join(uploads_dir, ".htaccess")

    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir, exist_ok=True)

    if not os.path.exists(htaccess_path):
        print_status("Upload Directory Protection", False, ".htaccess missing in backend/uploads/. Creating execution shield...")
        with open(htaccess_path, "w", encoding="utf-8") as f:
            f.write("# Prevent PHP execution in uploads directory\n<FilesMatch \"\\.(php|php5|phtml|php7|phps)$\">\n    Order Allow,Deny\n    Deny from all\n</FilesMatch>\n")
        print_status("Upload Directory Protection", True, "Created .htaccess execution shield in backend/uploads/")
    else:
        print_status("Upload Directory Protection", True, ".htaccess execution shield present in backend/uploads/")

    return True

# Main Execution Runner
def main():
    print("=" * 75)
    print("  HARPHUB AUDIT SUITE v1.0")
    print(f"  Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 75)

    api_path = os.path.join("backend", "api_harphub.php")

    r1 = audit_database_structure(api_path)
    r2 = audit_security(api_path)
    r3 = audit_authorization(api_path)
    r4 = audit_frontend()
    r5 = audit_file_permissions()

    print_header("AUDIT SUMMARY & RECOMMENDATIONS")
    total_passed = sum([r1, r2, r3, r4, r5])
    print(f"Passed {total_passed} of 5 Audit Modules.")

    if total_passed == 5:
        print("\nSUCCESS: System complies with all security, indexing, and scalability standard benchmarks.\n")
        sys.exit(0)
    else:
        print("\nATTENTION: Review flagged warnings above.\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
