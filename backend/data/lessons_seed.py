# ============== LESSON SEED DATA ==============
# Organized lesson data for the Violin Study Plan
# Total: 489 lessons across 6 progressive sessions + 1 fixed checklist

# Session configurations
SESSION_TYPES = [
    {
        "id": "warmup",
        "order": 1,
        "name": "Aquecimento",
        "icon": "🔥",
        "default_duration_sec": 300,  # 5 min
        "description": "Cordas soltas, postura, relaxamento",
        "type": "checklist",
        "tip": "Nunca pule o aquecimento. Um corpo relaxado é a fundação de uma boa técnica."
    },
    {
        "id": "scales",
        "order": 2,
        "name": "Escalas e Arpejos",
        "icon": "🎼",
        "default_duration_sec": 600,  # 10 min
        "description": "Flesch Scale System — uma tonalidade por semana",
        "type": "progressive",
        "tip": "Pratique escalas todos os dias. Elas são a base de toda a técnica violinística."
    },
    {
        "id": "bow",
        "order": 3,
        "name": "Técnica de Arco",
        "icon": "🎯",
        "default_duration_sec": 600,  # 10 min
        "description": "Ševčík Op.2 + Fischer Basics",
        "type": "progressive",
        "tip": "O arco é responsável por 80% do som. Dedique tempo a ele diariamente."
    },
    {
        "id": "speed",
        "order": 4,
        "name": "Velocidade e Dedilhado",
        "icon": "⚡",
        "default_duration_sec": 300,  # 5 min
        "description": "Schradieck Livro 1 + Ševčík Op.1",
        "type": "progressive",
        "tip": "Velocidade vem de relaxamento, não de tensão. Comece lento, acelere gradualmente."
    },
    {
        "id": "positions",
        "order": 5,
        "name": "Posições e Trinados",
        "icon": "🔀",
        "default_duration_sec": 300,  # 5 min
        "description": "Ševčík Op.8 + Ševčík Op.7",
        "type": "progressive",
        "tip": "Mudanças de posição devem ser preparadas mentalmente antes de executadas."
    },
    {
        "id": "studies",
        "order": 6,
        "name": "Estudos e Caprichos",
        "icon": "📖",
        "default_duration_sec": 600,  # 10 min
        "description": "Progressão completa de 9 métodos",
        "type": "progressive",
        "tip": "Siga a progressão sem pular métodos. Cada método prepara para o seguinte. Wohlfahrt→Kayser→Mazas→Dont 37→Kreutzer→Fiorillo→Rode→Dont 35→Paganini."
    },
    {
        "id": "repertoire",
        "order": 7,
        "name": "Repertório",
        "icon": "🎵",
        "default_duration_sec": 900,  # 15 min
        "description": "Peças progressivas do iniciante ao virtuoso",
        "type": "progressive",
        "tip": "NÃO toque do início ao fim repetidamente. Identifique os 3 compassos mais difíceis, isole-os, resolva-os, depois conecte. Nos últimos minutos, toque como se fosse um recital."
    },
]

# Methods/Authors
METHODS = [
    {"id": "flesch", "name": "Flesch Scale System", "author": "Carl Flesch", "category": "Escalas"},
    {"id": "sevcik_op2", "name": "Ševčík Op.2", "author": "Otakar Ševčík", "category": "Arco"},
    {"id": "fischer", "name": "Fischer Basics", "author": "Simon Fischer", "category": "Arco"},
    {"id": "schradieck", "name": "Schradieck Livro 1", "author": "Henry Schradieck", "category": "Dedilhado"},
    {"id": "sevcik_op1", "name": "Ševčík Op.1", "author": "Otakar Ševčík", "category": "Dedilhado"},
    {"id": "sevcik_op8", "name": "Ševčík Op.8", "author": "Otakar Ševčík", "category": "Posições"},
    {"id": "sevcik_op7", "name": "Ševčík Op.7", "author": "Otakar Ševčík", "category": "Posições"},
    {"id": "wohlfahrt", "name": "Wohlfahrt Op.45", "author": "Franz Wohlfahrt", "category": "Estudos"},
    {"id": "kayser", "name": "Kayser Op.20", "author": "Heinrich Ernst Kayser", "category": "Estudos"},
    {"id": "mazas", "name": "Mazas Op.36", "author": "Jacques Féréol Mazas", "category": "Estudos"},
    {"id": "dont_op37", "name": "Dont Op.37", "author": "Jakob Dont", "category": "Estudos"},
    {"id": "kreutzer", "name": "Kreutzer 42 Estudos", "author": "Rodolphe Kreutzer", "category": "Estudos"},
    {"id": "fiorillo", "name": "Fiorillo 36 Estudos", "author": "Federigo Fiorillo", "category": "Estudos"},
    {"id": "rode", "name": "Rode 24 Caprichos", "author": "Pierre Rode", "category": "Estudos"},
    {"id": "dont_op35", "name": "Dont Op.35", "author": "Jakob Dont", "category": "Estudos"},
    {"id": "paganini", "name": "Paganini 24 Caprichos", "author": "Niccolò Paganini", "category": "Estudos"},
]

# Level thresholds based on Studies (Session 6) progress
LEVEL_THRESHOLDS = [
    {"min": 0, "max": 59, "level": "Iniciante", "method_range": "Wohlfahrt"},
    {"min": 60, "max": 95, "level": "Iniciante–Intermediário", "method_range": "Kayser"},
    {"min": 96, "max": 125, "level": "Intermediário", "method_range": "Mazas"},
    {"min": 126, "max": 187, "level": "Intermediário–Avançado", "method_range": "Dont 37 + Kreutzer"},
    {"min": 188, "max": 247, "level": "Avançado", "method_range": "Fiorillo + Rode"},
    {"min": 248, "max": 271, "level": "Avançado Superior", "method_range": "Dont 35"},
    {"min": 272, "max": 296, "level": "Virtuoso", "method_range": "Paganini"},
]

# Warmup Checklist (Session 1 - fixed daily)
WARMUP_CHECKLIST = [
    {"id": 1, "text": "Alongamento leve (dedos, pulsos, ombros) — 1 min"},
    {"id": 2, "text": "Cordas soltas — Sol (arco inteiro, 4 tempos por arcada, ♩=60)"},
    {"id": 3, "text": "Cordas soltas — Ré (idem)"},
    {"id": 4, "text": "Cordas soltas — Lá (idem)"},
    {"id": 5, "text": "Cordas soltas — Mi (idem)"},
    {"id": 6, "text": "Verificação: ombro relaxado, arco reto, som ressonante"},
]

# ============== SCALES LESSONS (48) ==============
SCALES_LESSONS = [
    # Cycle 1 - Major Keys (12)
    {"id": 1, "title": "Dó Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas, 1ª posição até a 7ª. Arpejos maiores, menores, diminutos e dom7. Terças e sextas.", "tags": ["maior", "ciclo1"]},
    {"id": 2, "title": "Sol Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Foco em mudanças de posição limpas. Pratique com metrônomo.", "tags": ["maior", "ciclo1"]},
    {"id": 3, "title": "Ré Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Atenção especial às cordas soltas Ré e Lá. Arpejos em todas as inversões.", "tags": ["maior", "ciclo1"]},
    {"id": 4, "title": "Lá Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Pratique em détaché, legato (4, 8, 12 notas por arcada).", "tags": ["maior", "ciclo1"]},
    {"id": 5, "title": "Mi Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Cuidado com a afinação do Ré# e Sol#.", "tags": ["maior", "ciclo1"]},
    {"id": 6, "title": "Si Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Posições mais altas exigem atenção na afinação.", "tags": ["maior", "ciclo1"]},
    {"id": 7, "title": "Fá# Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Tonalidade com muitos sustenidos — mantenha os dedos altos.", "tags": ["maior", "ciclo1"]},
    {"id": 8, "title": "Dó# Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Enarmônico de Réb Maior. Pratique pensando nas duas tonalidades.", "tags": ["maior", "ciclo1"]},
    {"id": 9, "title": "Fá Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Único bemol (Sib). Boa para consolidar a técnica de mudança.", "tags": ["maior", "ciclo1"]},
    {"id": 10, "title": "Sib Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Dois bemóis. Pratique arpejos em staccato também.", "tags": ["maior", "ciclo1"]},
    {"id": 11, "title": "Mib Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Três bemóis. Atenção ao Láb e Réb.", "tags": ["maior", "ciclo1"]},
    {"id": 12, "title": "Láb Maior", "method_id": "flesch", "subtitle": "Ciclo 1 — Maiores", "instruction": "Escala de 3 oitavas. Quatro bemóis. Tonalidade mais cromática.", "tags": ["maior", "ciclo1"]},
    # Cycle 2 - Minor Keys (12)
    {"id": 13, "title": "Lá menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas (harmônica e melódica). Compare a sensível nas duas formas.", "tags": ["menor", "ciclo2"]},
    {"id": 14, "title": "Mi menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Relativa de Sol Maior. Pratique as duas formas.", "tags": ["menor", "ciclo2"]},
    {"id": 15, "title": "Si menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Tonalidade expressiva. Muito usada no repertório.", "tags": ["menor", "ciclo2"]},
    {"id": 16, "title": "Fá# menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Três sustenidos. Atenção ao Mi# na harmônica.", "tags": ["menor", "ciclo2"]},
    {"id": 17, "title": "Dó# menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Quatro sustenidos. Tonalidade de obras importantes.", "tags": ["menor", "ciclo2"]},
    {"id": 18, "title": "Sol# menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Cinco sustenidos. Equivalente a Láb menor.", "tags": ["menor", "ciclo2"]},
    {"id": 19, "title": "Ré# menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Seis sustenidos. Enarmônico de Mib menor.", "tags": ["menor", "ciclo2"]},
    {"id": 20, "title": "Ré menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Relativa de Fá Maior. Muito comum no repertório barroco.", "tags": ["menor", "ciclo2"]},
    {"id": 21, "title": "Sol menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Dois bemóis. Tonalidade de Bach BWV 1001.", "tags": ["menor", "ciclo2"]},
    {"id": 22, "title": "Dó menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Três bemóis. Tonalidade dramática.", "tags": ["menor", "ciclo2"]},
    {"id": 23, "title": "Fá menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Quatro bemóis. Pratique com diferentes articulações.", "tags": ["menor", "ciclo2"]},
    {"id": 24, "title": "Sib menor", "method_id": "flesch", "subtitle": "Ciclo 2 — Menores", "instruction": "Escala de 3 oitavas. Cinco bemóis. Tonalidade rara mas importante.", "tags": ["menor", "ciclo2"]},
    # Cycle 3 - Double Stops (12)
    {"id": 25, "title": "Dó Maior — Terças", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Terças diatônicas em 3 oitavas. Mantenha os dois dedos sincronizados.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 26, "title": "Dó Maior — Sextas", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Sextas diatônicas em 3 oitavas. Afinação crítica entre os dedos.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 27, "title": "Dó Maior — Oitavas", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Oitavas em 3 oitavas. Mão firme mas não tensa. Vibrato nas oitavas.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 28, "title": "Dó Maior — Décimas", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Décimas em 2 oitavas. Extensão máxima da mão. Cuidado com tensão.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 29, "title": "Sol Maior — Terças", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Terças diatônicas. Aproveite a corda solta Sol como referência.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 30, "title": "Sol Maior — Sextas", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Sextas diatônicas. Pratique lento para afinação perfeita.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 31, "title": "Sol Maior — Oitavas", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Oitavas completas. Transições suaves entre posições.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 32, "title": "Sol Maior — Décimas", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Décimas. Prepare cada extensão mentalmente antes de tocar.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 33, "title": "Ré Maior — Terças", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Terças em Ré Maior. Tonalidade brilhante do violino.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 34, "title": "Ré Maior — Sextas", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Sextas em Ré Maior. Use a ressonância das cordas soltas.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 35, "title": "Ré Maior — Oitavas", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Oitavas em Ré Maior. Muitos concertos nesta tonalidade.", "tags": ["cordas_duplas", "ciclo3"]},
    {"id": 36, "title": "Ré Maior — Décimas", "method_id": "flesch", "subtitle": "Ciclo 3 — Cordas Duplas", "instruction": "Décimas em Ré Maior. Pratique a extensão gradualmente.", "tags": ["cordas_duplas", "ciclo3"]},
    # Cycle 4 - Special Techniques (12)
    {"id": 37, "title": "Escala Cromática — 1 dedo", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Cromática usando apenas o 1º dedo. Deslize preciso entre semitons.", "tags": ["cromatica", "ciclo4"]},
    {"id": 38, "title": "Escala Cromática — 2 dedos", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Cromática com dedos 1-2 ou 2-3 alternados. Velocidade e precisão.", "tags": ["cromatica", "ciclo4"]},
    {"id": 39, "title": "Escala Cromática — completa", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Cromática com todos os dedos. O padrão clássico Flesch.", "tags": ["cromatica", "ciclo4"]},
    {"id": 40, "title": "Escala de Tons Inteiros", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Escala de tons inteiros. Som 'impressionista'. Afinação diferente.", "tags": ["especial", "ciclo4"]},
    {"id": 41, "title": "Arpejos Diminutos", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Arpejos diminutos em todas as 4 inversões. Simetria do acorde.", "tags": ["arpejo", "ciclo4"]},
    {"id": 42, "title": "Arpejos Aumentados", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Arpejos aumentados. Três inversões simétricas.", "tags": ["arpejo", "ciclo4"]},
    {"id": 43, "title": "Arpejos Dom7", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Dominantes com sétima em todas as tonalidades. Resolução auditiva.", "tags": ["arpejo", "ciclo4"]},
    {"id": 44, "title": "Arpejos Dim7", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Diminutos com sétima. Muito usado em cadências e passagens.", "tags": ["arpejo", "ciclo4"]},
    {"id": 45, "title": "Harmônicos Naturais", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Harmônicos naturais em todas as cordas. Toque leve, arco rápido.", "tags": ["harmonico", "ciclo4"]},
    {"id": 46, "title": "Harmônicos Artificiais", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Harmônicos artificiais (4ª justa). Pressão precisa do 4º dedo.", "tags": ["harmonico", "ciclo4"]},
    {"id": 47, "title": "Pizzicato Mão Esquerda", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Pizzicato com a mão esquerda. Força e independência dos dedos.", "tags": ["pizzicato", "ciclo4"]},
    {"id": 48, "title": "Revisão Geral", "method_id": "flesch", "subtitle": "Ciclo 4 — Especiais", "instruction": "Revisão completa. Escolha tonalidades aleatórias e toque escalas e arpejos.", "tags": ["revisao", "ciclo4"]},
]

# ============== BOW TECHNIQUE LESSONS (43) ==============
BOW_TECHNIQUE_LESSONS = []
# Ševčík Op.2 Part 1 (10)
for i in range(1, 11):
    topics = ["Divisão do arco", "Arco inteiro", "Détaché inferior", "Détaché superior", "Détaché rápido",
              "Legato 2 notas", "Legato 4 notas", "Legato 8 notas", "Martelé preparação", "Martelé execução"]
    BOW_TECHNIQUE_LESSONS.append({
        "id": i, "title": topics[i-1], "method_id": "sevcik_op2", "subtitle": "Parte 1",
        "instruction": f"Exercícios {(i-1)*5+1}-{i*5}. Desenvolva controle e consistência no arco.",
        "tags": ["sevcik", "parte1"]
    })
# Ševčík Op.2 Part 2 (10)
for i in range(11, 21):
    topics = ["Staccato lento", "Staccato ponta", "Staccato talão", "Staccato volante", "Spiccato equilíbrio",
              "Spiccato altura", "Spiccato velocidade", "Sautillé intro", "Sautillé velocidade", "Ricochet"]
    BOW_TECHNIQUE_LESSONS.append({
        "id": i, "title": topics[i-11], "method_id": "sevcik_op2", "subtitle": "Parte 2",
        "instruction": f"Exercícios {(i-11)*5+51}-{(i-10)*5+50}. Técnicas de arco saltado.",
        "tags": ["sevcik", "parte2"]
    })
# Fischer Basics (23)
fischer_topics = [
    "Sul tasto", "Sul ponticello", "Posição normal", "Velocidade lenta", "Velocidade rápida",
    "Variações dinâmicas", "Mudança de corda (ângulos)", "Mudança de corda (saltos)",
    "Cordas duplas (terças)", "Cordas duplas (sextas)", "Cordas duplas (oitavas)",
    "Acordes 3 notas", "Acordes 4 notas", "Tremolo medido", "Tremolo livre",
    "Bariolage básico", "Bariolage Bach", "Col legno", "Ponticello expressivo",
    "Flautando", "Portato", "Louré", "Son filé"
]
for i, topic in enumerate(fischer_topics, 21):
    BOW_TECHNIQUE_LESSONS.append({
        "id": i, "title": topic, "method_id": "fischer", "subtitle": "Basics",
        "instruction": f"Capítulo {i-20}. Técnica fundamental para sonoridade profissional.",
        "tags": ["fischer", "basics"]
    })

# ============== SPEED/FINGERING LESSONS (40) ==============
SPEED_FINGERING_LESSONS = []
# Schradieck (18)
for i in range(1, 19):
    SPEED_FINGERING_LESSONS.append({
        "id": i, "title": f"Padrão {i}", "method_id": "schradieck", "subtitle": "Livro 1",
        "instruction": f"Exercício {i}. Comece em ♩=60, aumente 4 bpm por dia até ♩=120.",
        "tags": ["schradieck", "velocidade"]
    })
# Ševčík Op.1 (22)
for i in range(19, 41):
    SPEED_FINGERING_LESSONS.append({
        "id": i, "title": f"Op.1 nº {i-18}", "method_id": "sevcik_op1", "subtitle": "Escola de Técnica",
        "instruction": f"Exercício {i-18}. Independência e força dos dedos.",
        "tags": ["sevcik", "dedilhado"]
    })

# ============== POSITIONS/TRILLS LESSONS (32) ==============
POSITIONS_TRILLS_LESSONS = []
# Ševčík Op.8 - Positions (16)
position_topics = [
    "1ª → 3ª (dedo 1)", "1ª → 3ª (dedo 2)", "1ª → 3ª (dedo 3)", "1ª → 2ª",
    "2ª → 4ª", "1ª → 4ª", "1ª → 5ª", "3ª → 5ª",
    "3ª → 7ª", "5ª → 7ª", "Descendente 3ª → 1ª", "Descendente 5ª → 1ª",
    "Descendente 7ª → 3ª", "Glissando expressivo", "Mudança limpa", "Todas as cordas"
]
for i, topic in enumerate(position_topics, 1):
    POSITIONS_TRILLS_LESSONS.append({
        "id": i, "title": topic, "method_id": "sevcik_op8", "subtitle": "Mudanças de Posição",
        "instruction": f"Mudança de posição: {topic}. Prepare mentalmente antes de executar.",
        "tags": ["sevcik", "posicao"]
    })
# Ševčík Op.7 - Trills (16)
trill_topics = [
    "Trinado 1-2", "Trinado 2-3", "Trinado 3-4", "Trinado 1-3",
    "Trinado 2-4", "Velocidade lenta", "Velocidade média", "Velocidade rápida",
    "Com terminação", "Com preparação", "Em cordas duplas", "Cromáticos",
    "Em posições", "Mordentes", "Grupetos", "Combinação"
]
for i, topic in enumerate(trill_topics, 17):
    POSITIONS_TRILLS_LESSONS.append({
        "id": i, "title": topic, "method_id": "sevcik_op7", "subtitle": "Trinados e Ornamentos",
        "instruction": f"Ornamento: {topic}. Clareza e velocidade controlada.",
        "tags": ["sevcik", "trinado"]
    })

# ============== STUDIES LESSONS (296) ==============
STUDIES_LESSONS = []
lesson_id = 1

# Wohlfahrt Op.45 (60)
for i in range(1, 61):
    STUDIES_LESSONS.append({
        "id": lesson_id, "title": f"Wohlfahrt nº {i}", "method_id": "wohlfahrt",
        "subtitle": "60 Estudos Op.45", "level": "Iniciante",
        "instruction": f"Estudo nº {i}. Fundamentos de leitura, afinação e ritmo. Metrônomo ♩=60-80.",
        "tags": ["wohlfahrt", "iniciante"]
    })
    lesson_id += 1

# Kayser Op.20 (36)
for i in range(1, 37):
    STUDIES_LESSONS.append({
        "id": lesson_id, "title": f"Kayser nº {i}", "method_id": "kayser",
        "subtitle": "36 Estudos Op.20", "level": "Iniciante–Intermediário",
        "instruction": f"Estudo nº {i}. Técnica mais elaborada. Metrônomo ♩=72-96.",
        "tags": ["kayser", "iniciante-intermediario"]
    })
    lesson_id += 1

# Mazas Op.36 (30)
for i in range(1, 31):
    STUDIES_LESSONS.append({
        "id": lesson_id, "title": f"Mazas nº {i}", "method_id": "mazas",
        "subtitle": "30 Estudos Especiais Op.36", "level": "Intermediário",
        "instruction": f"Estudo Especial nº {i}. Virtuosismo inicial. Metrônomo ♩=80-108.",
        "tags": ["mazas", "intermediario"]
    })
    lesson_id += 1

# Dont Op.37 (24)
for i in range(1, 25):
    STUDIES_LESSONS.append({
        "id": lesson_id, "title": f"Dont Op.37 nº {i}", "method_id": "dont_op37",
        "subtitle": "24 Estudos Preparatórios", "level": "Intermediário–Avançado",
        "instruction": f"Estudo Preparatório nº {i}. Preparação para Kreutzer.",
        "tags": ["dont", "intermediario-avancado"]
    })
    lesson_id += 1

# Kreutzer (42)
for i in range(1, 43):
    special_notes = {
        2: "O famoso estudo de trinados. Resistência do 4º dedo.",
        8: "Détaché rápido. Teste de arco.",
        9: "Legato expressivo. Cantabile.",
        12: "Spiccato. Ponto de equilíbrio do arco.",
        13: "Staccato. Articulação clara."
    }
    instruction = special_notes.get(i, f"Estudo nº {i}. O 'Antigo Testamento' dos estudos.")
    STUDIES_LESSONS.append({
        "id": lesson_id, "title": f"Kreutzer nº {i}", "method_id": "kreutzer",
        "subtitle": "42 Estudos", "level": "Intermediário–Avançado",
        "instruction": instruction + " Metrônomo ♩=88-120.",
        "tags": ["kreutzer", "intermediario-avancado"]
    })
    lesson_id += 1

# Fiorillo (36)
for i in range(1, 37):
    STUDIES_LESSONS.append({
        "id": lesson_id, "title": f"Fiorillo nº {i}", "method_id": "fiorillo",
        "subtitle": "36 Estudos", "level": "Avançado",
        "instruction": f"Estudo nº {i}. Transição para o repertório avançado. Metrônomo ♩=96-126.",
        "tags": ["fiorillo", "avancado"]
    })
    lesson_id += 1

# Rode (24)
for i in range(1, 25):
    STUDIES_LESSONS.append({
        "id": lesson_id, "title": f"Rode Capricho nº {i}", "method_id": "rode",
        "subtitle": "24 Caprichos", "level": "Avançado",
        "instruction": f"Capricho nº {i}. Obras de concerto disfarçadas de estudos. ♩=100-132.",
        "tags": ["rode", "avancado"]
    })
    lesson_id += 1

# Dont Op.35 (24)
for i in range(1, 25):
    STUDIES_LESSONS.append({
        "id": lesson_id, "title": f"Dont Op.35 nº {i}", "method_id": "dont_op35",
        "subtitle": "24 Estudos e Caprichos", "level": "Avançado Superior",
        "instruction": f"Estudo nº {i}. Virtuosismo extremo. Preparação final para Paganini. ♩=108-144.",
        "tags": ["dont", "avancado-superior"]
    })
    lesson_id += 1

# Paganini (24)
paganini_notes = {
    1: "Arpejos em Mi maior. Ricochet e bariolage.",
    5: "Agilità. Escalas rápidas e saltos.",
    9: "'La Chasse'. Cordas duplas e flautando.",
    13: "'O Riso do Diabo'. Trinados diabólicos.",
    17: "Oitavas e cordas duplas. Resistência.",
    24: "O mais famoso. Tema e variações. O teste final."
}
for i in range(1, 25):
    instruction = paganini_notes.get(i, f"Capricho nº {i}. O Everest do violino.")
    STUDIES_LESSONS.append({
        "id": lesson_id, "title": f"Paganini Capricho nº {i}", "method_id": "paganini",
        "subtitle": "24 Caprichos", "level": "Virtuoso",
        "instruction": instruction + " Virtuosismo absoluto.",
        "tags": ["paganini", "virtuoso"]
    })
    lesson_id += 1

# ============== REPERTOIRE LESSONS (30) ==============
REPERTOIRE_LESSONS = [
    {"id": 1, "title": "Küchler — Concertino Op.12", "method_id": None, "subtitle": "Sol Maior", "level": "Iniciante", "instruction": "Primeiro concertino. 1ª posição, détaché e legato básico.", "tags": ["concertino", "iniciante"]},
    {"id": 2, "title": "Rieding — Concertino Op.35", "method_id": None, "subtitle": "Si menor", "level": "Iniciante", "instruction": "Concertino expressivo. Oportunidades para musicalidade.", "tags": ["concertino", "iniciante"]},
    {"id": 3, "title": "Seitz — Concerto nº 5", "method_id": None, "subtitle": "Ré Maior", "level": "Iniciante", "instruction": "Concerto estudantil clássico. 1ª e 3ª posição.", "tags": ["concerto", "iniciante"]},
    {"id": 4, "title": "Seitz — Concerto nº 2", "method_id": None, "subtitle": "Sol Maior", "level": "Iniciante", "instruction": "Consolidação de técnicas iniciais.", "tags": ["concerto", "iniciante"]},
    {"id": 5, "title": "Vivaldi — Concerto Op.3 nº 6", "method_id": None, "subtitle": "Lá menor", "level": "Iniciante–Intermediário", "instruction": "Primeiro concerto 'real'. Mudanças de posição e articulação barroca.", "tags": ["concerto", "barroco"]},
    {"id": 6, "title": "Vivaldi — Primavera", "method_id": None, "subtitle": "As Quatro Estações", "level": "Intermediário", "instruction": "Obra icônica. Técnica de arco, trinados e posições até a 7ª.", "tags": ["concerto", "barroco"]},
    {"id": 7, "title": "Bach — Concerto BWV 1041", "method_id": None, "subtitle": "Lá menor", "level": "Intermediário", "instruction": "Estilo barroco. Polifonia implícita. Articulação clara.", "tags": ["concerto", "barroco"]},
    {"id": 8, "title": "Handel — Sonata nº 4", "method_id": None, "subtitle": "Ré Maior", "level": "Intermediário", "instruction": "Sonata barroca com movimentos contrastantes.", "tags": ["sonata", "barroco"]},
    {"id": 9, "title": "Mozart — Concerto nº 3 K.216", "method_id": None, "subtitle": "Sol Maior", "level": "Intermediário", "instruction": "Elegância clássica. Pureza de som, afinação impecável.", "tags": ["concerto", "classico"]},
    {"id": 10, "title": "Mozart — Concerto nº 5 K.219", "method_id": None, "subtitle": "Lá Maior", "level": "Intermediário", "instruction": "O 'Turkish' concerto. Variedade de caracteres.", "tags": ["concerto", "classico"]},
    {"id": 11, "title": "Monti — Czardas", "method_id": None, "subtitle": "", "level": "Intermediário", "instruction": "Seção lenta expressiva + seção rápida virtuosística.", "tags": ["peca", "romantismo"]},
    {"id": 12, "title": "Massenet — Meditação de Thaïs", "method_id": None, "subtitle": "", "level": "Intermediário", "instruction": "Vibrato, cantabile, controle de arco em dinâmicas suaves.", "tags": ["peca", "romantismo"]},
    {"id": 13, "title": "Bartók — Danças Romenas", "method_id": None, "subtitle": "", "level": "Intermediário", "instruction": "Ritmos irregulares e cores tímbricas variadas.", "tags": ["peca", "moderno"]},
    {"id": 14, "title": "Kreisler — Praeludium and Allegro", "method_id": None, "subtitle": "", "level": "Intermediário–Avançado", "instruction": "Acordes, arpejos e passagens rápidas.", "tags": ["peca", "romantismo"]},
    {"id": 15, "title": "Kabalevsky — Concerto Op.48", "method_id": None, "subtitle": "Dó Maior", "level": "Intermediário–Avançado", "instruction": "Concerto brilhante. Preparação para concertos maiores.", "tags": ["concerto", "moderno"]},
    {"id": 16, "title": "Bach — Chaconne BWV 1004", "method_id": None, "subtitle": "Partita nº 2", "level": "Avançado", "instruction": "O Velho Testamento do violino. Obra monumental para violino solo.", "tags": ["solo", "barroco"]},
    {"id": 17, "title": "Bach — Sonata nº 1 BWV 1001", "method_id": None, "subtitle": "Sol menor", "level": "Avançado", "instruction": "Fuga e Adagio. Polifonia a várias vozes no violino.", "tags": ["solo", "barroco"]},
    {"id": 18, "title": "Bruch — Concerto nº 1 Op.26", "method_id": None, "subtitle": "Sol menor", "level": "Avançado", "instruction": "Um dos concertos mais amados. Romantismo e virtuosismo equilibrados.", "tags": ["concerto", "romantismo"]},
    {"id": 19, "title": "Mendelssohn — Concerto Op.64", "method_id": None, "subtitle": "Mi menor", "level": "Avançado", "instruction": "Obra-prima. Exige tudo: técnica, musicalidade, resistência.", "tags": ["concerto", "romantismo"]},
    {"id": 20, "title": "Lalo — Symphonie Espagnole", "method_id": None, "subtitle": "", "level": "Avançado", "instruction": "Cores espanholas, virtuosismo e brilho. 5 movimentos.", "tags": ["concerto", "romantismo"]},
    {"id": 21, "title": "Saint-Saëns — Concerto nº 3", "method_id": None, "subtitle": "Si menor", "level": "Avançado", "instruction": "Concerto brilhante e dramático. Projeção sonora.", "tags": ["concerto", "romantismo"]},
    {"id": 22, "title": "Wieniawski — Concerto nº 2", "method_id": None, "subtitle": "Ré menor", "level": "Avançado", "instruction": "Romantismo apaixonado e virtuosismo.", "tags": ["concerto", "romantismo"]},
    {"id": 23, "title": "Tchaikovsky — Concerto Op.35", "method_id": None, "subtitle": "Ré Maior", "level": "Avançado", "instruction": "Grande concerto russo. Paixão, poder e virtuosismo extremo.", "tags": ["concerto", "romantismo"]},
    {"id": 24, "title": "Beethoven — Concerto Op.61", "method_id": None, "subtitle": "Ré Maior", "level": "Avançado", "instruction": "O concerto mais nobre. Elegância suprema.", "tags": ["concerto", "classico"]},
    {"id": 25, "title": "Brahms — Concerto Op.77", "method_id": None, "subtitle": "Ré Maior", "level": "Avançado", "instruction": "Concerto sinfônico. Maturidade musical e som grande.", "tags": ["concerto", "romantismo"]},
    {"id": 26, "title": "Sibelius — Concerto Op.47", "method_id": None, "subtitle": "Ré menor", "level": "Avançado", "instruction": "Atmosfera nórdica. Tecnicamente brutal.", "tags": ["concerto", "moderno"]},
    {"id": 27, "title": "Prokofiev — Concerto nº 1", "method_id": None, "subtitle": "Ré Maior", "level": "Avançado", "instruction": "Modernismo lírico. Sonoridades etéreas.", "tags": ["concerto", "moderno"]},
    {"id": 28, "title": "Prokofiev — Concerto nº 2", "method_id": None, "subtitle": "Sol menor", "level": "Avançado", "instruction": "Mais dramático. Variedade de cores e articulações.", "tags": ["concerto", "moderno"]},
    {"id": 29, "title": "Shostakovich — Concerto nº 1", "method_id": None, "subtitle": "Lá menor", "level": "Avançado", "instruction": "Profundidade emocional. Cadenza monumental.", "tags": ["concerto", "moderno"]},
    {"id": 30, "title": "Paganini — Concerto nº 1", "method_id": None, "subtitle": "Ré Maior", "level": "Virtuoso", "instruction": "O Everest do violino. Harmônicos, staccato volante, posições extremas.", "tags": ["concerto", "virtuoso"]},
]

# Repertoire study instructions
REPERTOIRE_STUDY_GUIDE = """
Dia 1-2: Leitura lenta, nota por nota, afinação perfeita. Sem pressa.
Dia 3-4: Identifique trechos difíceis e isole-os (pratique em loop).
Dia 5-6: Toque inteiro com metrônomo em andamento moderado.
Dia 7+: Toque no andamento final com musicalidade e expressão.
Avance somente quando sentir domínio completo.
"""

def get_all_lessons():
    """Returns all lessons organized by session type"""
    return {
        "scales": SCALES_LESSONS,
        "bow": BOW_TECHNIQUE_LESSONS,
        "speed": SPEED_FINGERING_LESSONS,
        "positions": POSITIONS_TRILLS_LESSONS,
        "studies": STUDIES_LESSONS,
        "repertoire": REPERTOIRE_LESSONS,
    }

def get_total_lessons():
    """Returns total count of all lessons"""
    all_lessons = get_all_lessons()
    return sum(len(lessons) for lessons in all_lessons.values())
