/**
 * Mock data for HarpHub social features testing.
 * Includes users, feed activities, and discovery data.
 */

export const MOCK_USERS = [
    {
        id: 101,
        username: "harper_pro",
        full_name: "Marcos Harmónica",
        avatar_url: "/mock/avatars/harmonica_pro.png",
        bio: "Maestro de la armónica diatónica. Explorando el blues y el jazz desde Buenos Aires.",
        instrument: "Armónica",
        followers_count: 1240,
        following_count: 150,
        stats: {
            practice_hours: 450,
            lessons_created: 12,
            streak_days: 15
        }
    },
    {
        id: 102,
        username: "guitar_soul",
        full_name: "Elena Cuerdas",
        avatar_url: "/mock/avatars/guitar_star.png",
        bio: "Guitarrista sesionista. Fanática de los solos de David Gilmour y la técnica de Mark Knopfler.",
        instrument: "Guitarra",
        followers_count: 850,
        following_count: 320,
        stats: {
            practice_hours: 320,
            lessons_created: 8,
            streak_days: 7
        }
    },
    {
        id: 103,
        username: "piano_wizard",
        full_name: "Julián Teclas",
        avatar_url: "/mock/avatars/piano_master.png",
        bio: "Compositor y profesor de piano. Transformando la teoría musical en algo simple.",
        instrument: "Piano",
        followers_count: 2100,
        following_count: 80,
        stats: {
            practice_hours: 1200,
            lessons_created: 25,
            streak_days: 30
        }
    }
];

export const MOCK_ACTIVITIES = [
    {
        id: "act_1",
        type: "practice",
        user_id: 101,
        username: "harper_pro",
        avatar_url: "/mock/avatars/harmonica_pro.png",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        metadata: {
            bpm: 120,
            duration: 1800, // 30 mins
            instrument: "Armónica",
            technique: "Bending en celda 4"
        }
    },
    {
        id: "act_2",
        type: "lesson_new",
        user_id: 103,
        username: "piano_wizard",
        avatar_url: "/mock/avatars/piano_master.png",
        lesson_title: "Escalas de Blues en Piano para Principiantes",
        content_id: "lesson_456",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        metadata: {
            level: "Principiante",
            category: "Teoría"
        }
    },
    {
        id: "act_3",
        type: "practice",
        user_id: 102,
        username: "guitar_soul",
        avatar_url: "/mock/avatars/guitar_star.png",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        metadata: {
            bpm: 95,
            duration: 3600, // 60 mins
            instrument: "Guitarra",
            technique: "Alternate Picking"
        }
    },
    {
        id: "act_4",
        type: "user_joined",
        user_id: 104,
        username: "nuevo_talento",
        avatar_url: null,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        metadata: {}
    },
    {
        id: "act_5",
        type: "lesson_fork",
        user_id: 101,
        username: "harper_pro",
        avatar_url: "/mock/avatars/harmonica_pro.png",
        lesson_title: "Solo de Blues Clásico (Fork de Elena)",
        content_id: "lesson_789",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        metadata: {
            original_author: "guitar_soul"
        }
    }
];

export const MOCK_DISCOVERY = {
    success: true,
    creators: MOCK_USERS,
    collections: [
        {
            id: "col_1",
            title: "Fundamentos del Blues",
            description: "Todo lo que necesitas para empezar a sonar como un profesional del blues.",
            cover_image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
            lesson_count: 15,
            sample_youtube_id: "dQw4w9WgXcQ"
        },
        {
            id: "col_2",
            title: "Técnica Avanzada de Guitarra",
            description: "Dominio del mástil, arpegios y velocidad controlada.",
            cover_image: "https://images.unsplash.com/photo-1525201548112-c99fa169d0f0?auto=format&fit=crop&q=80&w=800",
            lesson_count: 10,
            sample_youtube_id: "XmSdTa9kaiQ"
        }
    ],
    paths: [
        {
            id: "path_1",
            title: "Ruta del Maestro de la Armónica",
            description: "Desde cero hasta tocar tu primer solo completo de 12 compases.",
            instrument: "Armónica",
            creator_name: "harper_pro",
            node_count: 12
        },
        {
            id: "path_2",
            title: "Piano Moderno: Del Pop al Jazz",
            description: "Aprende a armonizar cualquier canción con acordes modernos.",
            instrument: "Piano",
            creator_name: "piano_wizard",
            node_count: 20
        }
    ]
};
