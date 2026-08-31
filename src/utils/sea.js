export const SEA_SYMBOLS = {
    bends: [
        { label: "'", value: "'", desc: 'Medio Bend' },
        { label: "''", value: "''", desc: 'Bend Completo' },
        { label: "'''", value: "'''", desc: 'Bend 1.5' },
        { label: "^", value: "^", desc: 'Overblow/draw' },
    ],
    durations: [
        { label: 'w', value: 'w', desc: 'Redonda' },
        { label: 'h', value: 'h', desc: 'Blanca' },
        { label: 'q', value: 'q', desc: 'Negra' },
        { label: 'e', value: 'e', desc: 'Corchea' },
        { label: 's', value: 's', desc: 'Semicorchea' },
        { label: '.', value: '.', desc: 'Puntillo' },
    ],
    expressions: [
        { label: '~', value: '~', desc: 'Vibrato' },
        { label: '_', value: '_', desc: 'Glissando' },
        { label: '>', value: '>', desc: 'Acento' },
        { label: 'T', value: 'T', desc: 'Tongue Slap' },
    ],
    structure: [
        { label: '|', value: '|', desc: 'Barra de Compás' },
        { label: '(', value: '(', desc: 'Inicio Acorde' },
        { label: ')', value: ')', desc: 'Fin Acorde' },
        { label: '{', value: '{', desc: 'Inicio Trino' },
        { label: '}', value: '}', desc: 'Fin Trino' },
        { label: '3[', value: '3[', desc: 'Inicio Tresillo' },
        { label: ']', value: ']', desc: 'Fin Tresillo' },
        { label: 'R', value: 'R', desc: 'Silencio' },
    ]
};

export const parseSEAToken = (token) => {
    const regex = /^([({]|3\[)?(-?\d+|R)([']{1,3}|\^)?([whqes]\.?)?([~_>T]+)?([)}]|\])?$/;
    const match = token.match(regex);
    if (!match) return { raw: token };
    return {
        prefix: match[1] || '',
        body: match[2],
        bend: match[3] || '',
        duration: match[4] || '',
        expression: match[5] || '',
        suffix: match[6] || ''
    };
};

export const getDurationValue = (dur) => {
    if (!dur) return 0;
    let base = 0;
    if (dur.includes('w')) base = 4;
    else if (dur.includes('h')) base = 2;
    else if (dur.includes('q')) base = 1;
    else if (dur.includes('e')) base = 0.5;
    else if (dur.includes('s')) base = 0.25;
    
    if (dur.includes('.')) base *= 1.5;
    return base;
};

export const validateMeasures = (text) => {
    if (!text) return [];
    const tokens = text.split(/[\s,]+/);
    let measures = [];
    let currentMeasure = { beats: 0, tokens: [], valid: false };

    tokens.forEach(t => {
        if (!t) return;
        
        if (t === '|') {
            currentMeasure.valid = Math.abs(currentMeasure.beats - 4) < 0.01;
            measures.push(currentMeasure);
            currentMeasure = { beats: 0, tokens: [], valid: false };
            return;
        }

        const p = parseSEAToken(t);
        let val = getDurationValue(p.duration);
        if (t.includes('3[') || p.prefix === '3[') val *= (2/3);

        // Si agregar este token supera los 4 beats, y el compás actual ya está casi lleno o el token es grande
        // Pero el requerimiento dice "cuando supero un compas empieza a mostrar una segunda bolita"
        // Vamos a ser proactivos: si el compás actual está completo (4), pushear y empezar nuevo
        if (Math.abs(currentMeasure.beats - 4) < 0.01) {
            currentMeasure.valid = true;
            measures.push(currentMeasure);
            currentMeasure = { beats: 0, tokens: [], valid: false };
        }

        currentMeasure.beats += val;
        currentMeasure.tokens.push(t);
    });

    if (currentMeasure.tokens.length > 0 || measures.length === 0) {
        currentMeasure.valid = Math.abs(currentMeasure.beats - 4) < 0.01;
        measures.push(currentMeasure);
    }
    return measures;
};
