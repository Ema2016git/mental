// =============================================
//  SISTEMA DE IDIOMAS — i18n
// =============================================
const LANGS = {
  es: { flag: '🇪🇸', name: 'Español' },
  en: { flag: '🇬🇧', name: 'English' },
  pt: { flag: '🇧🇷', name: 'Português' },
  fr: { flag: '🇫🇷', name: 'Français' },
};

let currentLang = localStorage.getItem('app_lang') || 'es';

const I18N = {
  // ---- NAV ----
  nav_title:        { es: 'Mi Diario Escolar',   en: 'My School Diary',      pt: 'Meu Diário Escolar',   fr: 'Mon Journal Scolaire' },
  nav_diary:        { es: '📖 Mi Diario',        en: '📖 My Diary',          pt: '📖 Meu Diário',        fr: '📖 Mon Journal' },
  nav_ai:           { es: '🤖 Mi IA',            en: '🤖 My AI',             pt: '🤖 Minha IA',          fr: '🤖 Mon IA' },
  nav_graph:        { es: '📊 Gráficos',         en: '📊 Charts',            pt: '📊 Gráficos',          fr: '📊 Graphiques' },
  nav_exercises:    { es: '✏️ Ejercicios',        en: '✏️ Exercises',          pt: '✏️ Exercícios',        fr: '✏️ Exercices' },
  nav_parents:      { es: '👨‍👩‍👧 Padres',          en: '👨‍👩‍👧 Parents',           pt: '👨‍👩‍👧 Pais',              fr: '👨‍👩‍👧 Parents' },

  // ---- AUTH ----
  login_tab:        { es: 'Iniciar Sesión',       en: 'Sign In',              pt: 'Entrar',                fr: 'Se Connecter' },
  register_tab:     { es: 'Crear Cuenta',         en: 'Sign Up',              pt: 'Criar Conta',           fr: 'Créer un Compte' },
  welcome_back:     { es: '👋 ¡Bienvenido de vuelta!', en: '👋 Welcome back!', pt: '👋 Bem-vindo de volta!', fr: '👋 Content de vous revoir!' },
  create_account:   { es: '🌟 ¡Crea tu cuenta!', en: '🌟 Create your account!', pt: '🌟 Crie sua conta!', fr: '🌟 Créez votre compte!' },
  your_name:        { es: '👤 Tu nombre',         en: '👤 Your name',          pt: '👤 Seu nome',           fr: '👤 Votre nom' },
  your_password:    { es: '🔑 Tu contraseña',     en: '🔑 Your password',      pt: '🔑 Sua senha',          fr: '🔑 Votre mot de passe' },
  name_placeholder: { es: 'Escribe tu nombre...', en: 'Type your name...',     pt: 'Digite seu nome...',    fr: 'Écrivez votre nom...' },
  pass_placeholder: { es: 'Tu contraseña secreta...', en: 'Your secret password...', pt: 'Sua senha secreta...', fr: 'Votre mot de passe secret...' },
  btn_login:        { es: 'Entrar 🚀',            en: 'Sign In 🚀',           pt: 'Entrar 🚀',            fr: 'Connexion 🚀' },
  your_age:         { es: '🎂 Tu edad',           en: '🎂 Your age',          pt: '🎂 Sua idade',          fr: '🎂 Votre âge' },
  age_placeholder:  { es: '¿Cuántos años tienes?', en: 'How old are you?',    pt: 'Quantos anos você tem?', fr: 'Quel âge avez-vous?' },
  create_password:  { es: '🔑 Crea una contraseña', en: '🔑 Create a password', pt: '🔑 Crie uma senha', fr: '🔑 Créez un mot de passe' },
  repeat_password:  { es: '🔑 Repite la contraseña', en: '🔑 Repeat password', pt: '🔑 Repita a senha', fr: '🔑 Répétez le mot de passe' },
  pass_create_ph:   { es: 'Algo que solo tú sepas...', en: 'Something only you know...', pt: 'Algo que só você sabe...', fr: 'Quelque chose que vous seul savez...' },
  pass_repeat_ph:   { es: 'Repítela aquí...',     en: 'Repeat it here...',     pt: 'Repita aqui...',        fr: 'Répétez ici...' },
  btn_register:     { es: '¡Crear mi cuenta! 🎉', en: 'Create my account! 🎉', pt: 'Criar minha conta! 🎉', fr: 'Créer mon compte! 🎉' },
  name_how:         { es: '¿Cómo te llamas?',     en: "What's your name?",    pt: 'Qual é o seu nome?',    fr: 'Comment vous appelez-vous?' },

  // ---- WELCOME ----
  welcome_hello:    { es: '👋 ¡Hola! Bienvenido a tu Diario Escolar', en: '👋 Hello! Welcome to your School Diary', pt: '👋 Olá! Bem-vindo ao seu Diário Escolar', fr: '👋 Bonjour! Bienvenue dans votre Journal Scolaire' },
  welcome_sub:      { es: 'Escribe cada día lo que aprendes. ¡Crea una cuenta para agregar más materias!', en: 'Write what you learn every day. Create an account to add more subjects!', pt: 'Escreva todos os dias o que aprende. Crie uma conta para adicionar mais matérias!', fr: 'Écrivez chaque jour ce que vous apprenez. Créez un compte pour ajouter des matières!' },
  have_account:     { es: '¿Ya tienes cuenta?',   en: 'Have an account?',      pt: 'Já tem conta?',         fr: 'Avez-vous un compte?' },
  btn_signin:       { es: '🔑 Iniciar Sesión',    en: '🔑 Sign In',           pt: '🔑 Entrar',             fr: '🔑 Connexion' },
  btn_signup:       { es: '🌟 Crear Cuenta',      en: '🌟 Sign Up',           pt: '🌟 Criar Conta',        fr: '🌟 Créer un Compte' },
  btn_logout:       { es: '🚪 Cerrar Sesión',     en: '🚪 Sign Out',          pt: '🚪 Sair',               fr: '🚪 Déconnexion' },

  // ---- DIARY ----
  hello_user:       { es: '¡Hola, {name}!',       en: 'Hello, {name}!',       pt: 'Olá, {name}!',         fr: 'Bonjour, {name}!' },
  welcome_user:     { es: '👋 ¡Hola, {name}!',    en: '👋 Hello, {name}!',    pt: '👋 Olá, {name}!',      fr: '👋 Bonjour, {name}!' },
  entries_saved:    { es: '¡Escribe lo que aprendiste hoy! Llevas {n} aprendizajes guardados.', en: 'Write what you learned today! You have {n} learnings saved.', pt: 'Escreva o que aprendeu hoje! Você tem {n} aprendizados salvos.', fr: 'Écrivez ce que vous avez appris! Vous avez {n} apprentissages sauvegardés.' },
  learning:         { es: 'aprendizaje',           en: 'learning',              pt: 'aprendizado',           fr: 'apprentissage' },
  learnings:        { es: 'aprendizajes',          en: 'learnings',             pt: 'aprendizados',          fr: 'apprentissages' },
  last_entry:       { es: 'Último:',               en: 'Last:',                 pt: 'Último:',               fr: 'Dernier:' },
  no_entries_yet:   { es: '¡Sin entradas aún! 🌱', en: 'No entries yet! 🌱',   pt: 'Sem entradas ainda! 🌱', fr: 'Pas encore d\'entrées! 🌱' },
  registered:       { es: 'registrado',            en: 'recorded',              pt: 'registrado',            fr: 'enregistré' },
  registered_p:     { es: 'registrados',           en: 'recorded',              pt: 'registrados',           fr: 'enregistrés' },
  days:             { es: 'días',                  en: 'days',                  pt: 'dias',                  fr: 'jours' },
  consecutive_days: { es: 'días seguidos',         en: 'consecutive days',      pt: 'dias seguidos',         fr: 'jours consécutifs' },
  back_to_subjects: { es: '← Volver a mis materias', en: '← Back to my subjects', pt: '← Voltar às matérias', fr: '← Retour à mes matières' },
  what_learned:     { es: '✏️ ¿Qué aprendiste hoy?', en: '✏️ What did you learn today?', pt: '✏️ O que você aprendeu hoje?', fr: '✏️ Qu\'avez-vous appris aujourd\'hui?' },
  date_label:       { es: '📅 Fecha',              en: '📅 Date',               pt: '📅 Data',               fr: '📅 Date' },
  text_label:       { es: '📝 Lo que aprendí',     en: '📝 What I learned',     pt: '📝 O que aprendi',      fr: '📝 Ce que j\'ai appris' },
  text_placeholder: { es: 'Hoy aprendí que...',    en: 'Today I learned that...', pt: 'Hoje aprendi que...', fr: 'Aujourd\'hui j\'ai appris que...' },
  btn_save_entry:   { es: 'Guardar Entrada 💾',    en: 'Save Entry 💾',         pt: 'Salvar Entrada 💾',     fr: 'Enregistrer 💾' },
  prev_learnings:   { es: '📖 Mis aprendizajes anteriores', en: '📖 My previous learnings', pt: '📖 Meus aprendizados anteriores', fr: '📖 Mes apprentissages précédents' },
  no_learnings:     { es: '¡Aún no tienes aprendizajes aquí!', en: 'No learnings here yet!', pt: 'Nenhum aprendizado aqui ainda!', fr: 'Pas encore d\'apprentissages ici!' },
  write_above:      { es: 'Escribe lo que aprendiste hoy 👆', en: 'Write what you learned today 👆', pt: 'Escreva o que aprendeu hoje 👆', fr: 'Écrivez ce que vous avez appris 👆' },

  // ---- SUBJECTS ----
  add_subject:      { es: '➕ Agregar Nueva Materia', en: '➕ Add New Subject', pt: '➕ Adicionar Nova Matéria', fr: '➕ Ajouter une Matière' },
  share_parents:    { es: '👨‍👩‍👧 Compartir con padres', en: '👨‍👩‍👧 Share with parents', pt: '👨‍👩‍👧 Compartilhar com pais', fr: '👨‍👩‍👧 Partager avec les parents' },
  export_pdf:       { es: '📄 Exportar PDF',       en: '📄 Export PDF',         pt: '📄 Exportar PDF',       fr: '📄 Exporter PDF' },
  new_subject:      { es: '➕ Nueva Materia',       en: '➕ New Subject',        pt: '➕ Nova Matéria',        fr: '➕ Nouvelle Matière' },
  subject_name:     { es: '📖 Nombre de la materia', en: '📖 Subject name',    pt: '📖 Nome da matéria',    fr: '📖 Nom de la matière' },
  subject_name_ph:  { es: 'Ej: Inglés, Ciencias, Arte...', en: 'E.g. English, Science, Art...', pt: 'Ex: Inglês, Ciências, Arte...', fr: 'Ex: Anglais, Sciences, Art...' },
  choose_emoji:     { es: '🎨 Elige un emoji',     en: '🎨 Choose an emoji',   pt: '🎨 Escolha um emoji',   fr: '🎨 Choisissez un emoji' },
  color_label:      { es: '🎨 Color',              en: '🎨 Color',              pt: '🎨 Cor',                fr: '🎨 Couleur' },
  btn_add_subject:  { es: 'Agregar Materia ✅',     en: 'Add Subject ✅',        pt: 'Adicionar Matéria ✅',   fr: 'Ajouter Matière ✅' },

  // ---- AI ----
  ai_verifying:     { es: 'Verificando...',         en: 'Checking...',           pt: 'Verificando...',        fr: 'Vérification...' },
  ai_local:         { es: 'Conectado (Local)',      en: 'Connected (Local)',     pt: 'Conectado (Local)',     fr: 'Connecté (Local)' },
  ai_cloud:         { es: 'Conectado (Nube)',       en: 'Connected (Cloud)',     pt: 'Conectado (Nuvem)',     fr: 'Connecté (Cloud)' },
  ai_offline:       { es: 'Desconectado',           en: 'Disconnected',          pt: 'Desconectado',          fr: 'Déconnecté' },
  ai_title:         { es: 'Mi IA',                  en: 'My AI',                 pt: 'Minha IA',              fr: 'Mon IA' },
  ai_new_chat:      { es: '🗑️ Nuevo chat',         en: '🗑️ New chat',          pt: '🗑️ Novo chat',         fr: '🗑️ Nouveau chat' },
  ai_hello:         { es: '¡Hola! Soy tu {type}',  en: 'Hello! I\'m your {type}', pt: 'Olá! Sou sua {type}', fr: 'Bonjour! Je suis votre {type}' },
  ai_local_label:   { es: 'IA Local',               en: 'Local AI',              pt: 'IA Local',              fr: 'IA Locale' },
  ai_cloud_label:   { es: 'IA Nube (Groq)',         en: 'Cloud AI (Groq)',       pt: 'IA Nuvem (Groq)',       fr: 'IA Cloud (Groq)' },
  ai_label:         { es: 'IA',                     en: 'AI',                    pt: 'IA',                    fr: 'IA' },
  ai_welcome_msg:   { es: 'Cuéntame qué aprendiste hoy y te haré preguntas para crear una entrada completa en tu diario. También puedo hacerte quizzes, explicarte temas o resumir tus aprendizajes.', en: 'Tell me what you learned today and I\'ll ask questions to create a complete diary entry. I can also quiz you, explain topics, or summarize your learnings.', pt: 'Me conte o que aprendeu hoje e farei perguntas para criar uma entrada completa no seu diário. Também posso fazer quizzes, explicar temas ou resumir seus aprendizados.', fr: 'Dites-moi ce que vous avez appris et je poserai des questions pour créer une entrée complète. Je peux aussi faire des quiz, expliquer des sujets ou résumer vos apprentissages.' },
  ai_input_ph:      { es: 'Escribe tu mensaje...', en: 'Type your message...', pt: 'Digite sua mensagem...', fr: 'Écrivez votre message...' },
  ai_input_hint:    { es: 'Enter para enviar · Shift+Enter para salto de línea · Los datos de tu diario se envían como contexto', en: 'Enter to send · Shift+Enter for new line · Your diary data is sent as context', pt: 'Enter para enviar · Shift+Enter para nova linha · Dados do diário enviados como contexto', fr: 'Entrée pour envoyer · Maj+Entrée pour saut de ligne · Les données du journal sont envoyées' },
  ai_sug1:          { es: '📝 Hoy en clase vimos los volcanes', en: '📝 Today in class we learned about volcanoes', pt: '📝 Hoje na aula vimos os vulcões', fr: '📝 Aujourd\'hui en classe on a vu les volcans' },
  ai_sug2:          { es: '🧠 Hazme un quiz de lo que sé', en: '🧠 Quiz me on what I know', pt: '🧠 Me faça um quiz do que sei', fr: '🧠 Fais-moi un quiz sur ce que je sais' },
  ai_sug3:          { es: '📖 Resúmeme mis aprendizajes', en: '📖 Summarize my learnings', pt: '📖 Resuma meus aprendizados', fr: '📖 Résume mes apprentissages' },
  ai_sug4:          { es: '💡 Explícame las fracciones', en: '💡 Explain fractions to me', pt: '💡 Me explique as frações', fr: '💡 Explique-moi les fractions' },
  ai_disconnected_title: { es: 'IA Desconectada', en: 'AI Disconnected', pt: 'IA Desconectada', fr: 'IA Déconnectée' },
  ai_option1:       { es: 'Tienes 2 opciones para activar la IA:', en: 'You have 2 options to activate the AI:', pt: 'Você tem 2 opções para ativar a IA:', fr: 'Vous avez 2 options pour activer l\'IA:' },
  ai_option_ollama: { es: 'Abre <strong>Ollama</strong> en tu PC (<code>ollama serve</code>)', en: 'Open <strong>Ollama</strong> on your PC (<code>ollama serve</code>)', pt: 'Abra o <strong>Ollama</strong> no seu PC (<code>ollama serve</code>)', fr: 'Ouvrez <strong>Ollama</strong> sur votre PC (<code>ollama serve</code>)' },
  ai_option_groq:   { es: 'Usa IA en la nube gratis con Groq:', en: 'Use free cloud AI with Groq:', pt: 'Use IA na nuvem grátis com Groq:', fr: 'Utilisez l\'IA cloud gratuit avec Groq:' },
  ai_config_groq:   { es: '🔑 Configurar Groq (gratis)', en: '🔑 Setup Groq (free)', pt: '🔑 Configurar Groq (grátis)', fr: '🔑 Configurer Groq (gratuit)' },
  ai_retry:         { es: '🔄 Reintentar conexión', en: '🔄 Retry connection', pt: '🔄 Tentar novamente', fr: '🔄 Réessayer la connexion' },
  ai_no_conn:       { es: '⚠️ No hay conexión a la IA. Configura Groq (botón 🔑) o abre Ollama en tu PC.', en: '⚠️ No AI connection. Set up Groq (🔑 button) or open Ollama on your PC.', pt: '⚠️ Sem conexão com a IA. Configure Groq (botão 🔑) ou abra o Ollama no seu PC.', fr: '⚠️ Pas de connexion IA. Configurez Groq (bouton 🔑) ou ouvrez Ollama sur votre PC.' },
  ai_invalid_key:   { es: '⚠️ API key de Groq inválida. Reconfigúrala con el botón ⚙️.', en: '⚠️ Invalid Groq API key. Reconfigure it with the ⚙️ button.', pt: '⚠️ Chave API do Groq inválida. Reconfigure com o botão ⚙️.', fr: '⚠️ Clé API Groq invalide. Reconfigurez avec le bouton ⚙️.' },
  ai_rate_limit:    { es: '⚠️ Límite de Groq alcanzado. Espera un momento e intenta de nuevo.', en: '⚠️ Groq rate limit reached. Wait a moment and try again.', pt: '⚠️ Limite do Groq atingido. Espere um momento e tente novamente.', fr: '⚠️ Limite Groq atteinte. Attendez et réessayez.' },
  ai_error_groq:    { es: '⚠️ Error de Groq: ', en: '⚠️ Groq error: ', pt: '⚠️ Erro do Groq: ', fr: '⚠️ Erreur Groq: ' },
  ai_saved_header:  { es: '✅ Guardado en tu diario:', en: '✅ Saved to your diary:', pt: '✅ Salvo no seu diário:', fr: '✅ Enregistré dans votre journal:' },
  ai_cancelled:     { es: 'Mensaje cancelado',     en: 'Message cancelled',     pt: 'Mensagem cancelada',    fr: 'Message annulé' },
  new_chat_toast:   { es: '🗑️ Nuevo chat iniciado', en: '🗑️ New chat started', pt: '🗑️ Novo chat iniciado', fr: '🗑️ Nouveau chat commencé' },

  // ---- GROQ SETUP ----
  groq_title:       { es: '🔑 Configurar Groq (Gratis)', en: '🔑 Setup Groq (Free)', pt: '🔑 Configurar Groq (Grátis)', fr: '🔑 Configurer Groq (Gratuit)' },
  groq_steps:       { es: 'Pasos:',                en: 'Steps:',                pt: 'Passos:',               fr: 'Étapes:' },
  groq_step1:       { es: 'Ve a',                   en: 'Go to',                 pt: 'Vá para',               fr: 'Allez à' },
  groq_step2:       { es: 'Crea una cuenta gratis (puedes usar Google)', en: 'Create a free account (you can use Google)', pt: 'Crie uma conta grátis (pode usar Google)', fr: 'Créez un compte gratuit (vous pouvez utiliser Google)' },
  groq_step3:       { es: 'Haz clic en', en: 'Click on', pt: 'Clique em', fr: 'Cliquez sur' },
  groq_step4:       { es: 'Copia la key y pégala aquí abajo:', en: 'Copy the key and paste it below:', pt: 'Copie a chave e cole abaixo:', fr: 'Copiez la clé et collez ci-dessous:' },
  groq_save:        { es: '💾 Guardar',             en: '💾 Save',               pt: '💾 Salvar',             fr: '💾 Enregistrer' },
  groq_cancel:      { es: 'Cancelar',               en: 'Cancel',                pt: 'Cancelar',              fr: 'Annuler' },
  groq_note:        { es: 'Tu API key se guarda solo en tu navegador (localStorage). Groq es gratis con límites generosos.', en: 'Your API key is saved only in your browser (localStorage). Groq is free with generous limits.', pt: 'Sua chave API é salva apenas no seu navegador (localStorage). Groq é grátis com limites generosos.', fr: 'Votre clé API est sauvegardée uniquement dans votre navigateur. Groq est gratuit avec des limites généreuses.' },
  groq_empty:       { es: '❌ Escribe tu API key de Groq', en: '❌ Enter your Groq API key', pt: '❌ Digite sua chave API do Groq', fr: '❌ Entrez votre clé API Groq' },
  groq_invalid:     { es: '⚠️ La key de Groq empieza con gsk_...', en: '⚠️ Groq key starts with gsk_...', pt: '⚠️ A chave do Groq começa com gsk_...', fr: '⚠️ La clé Groq commence par gsk_...' },
  groq_saved:       { es: '✅ API key guardada — conectando...', en: '✅ API key saved — connecting...', pt: '✅ Chave API salva — conectando...', fr: '✅ Clé API sauvegardée — connexion...' },

  // ---- EXERCISES ----
  ex_center:        { es: 'Centro de Ejercicios',  en: 'Exercise Center',       pt: 'Centro de Exercícios',  fr: 'Centre d\'Exercices' },
  ex_points:        { es: 'Puntos: {n}',           en: 'Points: {n}',           pt: 'Pontos: {n}',           fr: 'Points: {n}' },
  ex_subject:       { es: '📖 Materia',            en: '📖 Subject',            pt: '📖 Matéria',            fr: '📖 Matière' },
  ex_type:          { es: '🎯 Tipo de ejercicio',  en: '🎯 Exercise type',      pt: '🎯 Tipo de exercício',  fr: '🎯 Type d\'exercice' },
  ex_mixed:         { es: '🎲 Mixto',              en: '🎲 Mixed',              pt: '🎲 Misto',              fr: '🎲 Mixte' },
  ex_multiple:      { es: '🔘 Opción múltiple',    en: '🔘 Multiple choice',    pt: '🔘 Múltipla escolha',   fr: '🔘 Choix multiple' },
  ex_truefalse:     { es: '✅ Verdadero/Falso',    en: '✅ True/False',          pt: '✅ Verdadeiro/Falso',   fr: '✅ Vrai/Faux' },
  ex_fill:          { es: '✏️ Completar',           en: '✏️ Fill in',            pt: '✏️ Completar',          fr: '✏️ Compléter' },
  ex_amount:        { es: '📊 Cantidad',            en: '📊 Amount',             pt: '📊 Quantidade',         fr: '📊 Quantité' },
  ex_generate:      { es: '🚀 Generar Ejercicios', en: '🚀 Generate Exercises', pt: '🚀 Gerar Exercícios',  fr: '🚀 Générer des Exercices' },
  ex_correct:       { es: 'Correctas',              en: 'Correct',               pt: 'Corretas',              fr: 'Correctes' },
  ex_history_label: { es: '📜 Historial',           en: '📜 History',            pt: '📜 Histórico',          fr: '📜 Historique' },
  ex_no_history:    { es: 'Sin historial aún',      en: 'No history yet',        pt: 'Sem histórico ainda',   fr: 'Pas d\'historique' },
  ex_placeholder_title: { es: '¡Hora de practicar!', en: 'Time to practice!', pt: 'Hora de praticar!', fr: 'C\'est l\'heure de pratiquer!' },
  ex_placeholder_sub:   { es: 'Elige una materia y genera ejercicios. La IA creará preguntas basadas en lo que has aprendido en tu diario.', en: 'Choose a subject and generate exercises. The AI will create questions based on what you\'ve learned.', pt: 'Escolha uma matéria e gere exercícios. A IA criará perguntas baseadas no que você aprendeu.', fr: 'Choisissez une matière et générez des exercices. L\'IA créera des questions basées sur vos apprentissages.' },
  ex_loading:       { es: 'La IA está creando tus ejercicios...', en: 'The AI is creating your exercises...', pt: 'A IA está criando seus exercícios...', fr: 'L\'IA crée vos exercices...' },
  ex_check:         { es: 'Verificar ✓',            en: 'Check ✓',               pt: 'Verificar ✓',           fr: 'Vérifier ✓' },
  ex_correct_fb:    { es: '🎉 ¡Correcto!',         en: '🎉 Correct!',           pt: '🎉 Correto!',          fr: '🎉 Correct!' },
  ex_wrong_fb:      { es: '😕 Incorrecto',          en: '😕 Incorrect',          pt: '😕 Incorreto',          fr: '😕 Incorrect' },
  ex_correct_ans:   { es: '✅ Respuesta correcta:', en: '✅ Correct answer:',    pt: '✅ Resposta correta:',   fr: '✅ Bonne réponse:' },
  ex_true:          { es: '✅ Verdadero',            en: '✅ True',               pt: '✅ Verdadeiro',          fr: '✅ Vrai' },
  ex_false:         { es: '❌ Falso',                en: '❌ False',               pt: '❌ Falso',               fr: '❌ Faux' },
  ex_type_multiple: { es: 'Opción múltiple',        en: 'Multiple choice',       pt: 'Múltipla escolha',      fr: 'Choix multiple' },
  ex_type_tf:       { es: 'Verdadero / Falso',      en: 'True / False',          pt: 'Verdadeiro / Falso',    fr: 'Vrai / Faux' },
  ex_type_fill:     { es: 'Completar',              en: 'Fill in',               pt: 'Completar',             fr: 'Compléter' },
  ex_fill_ph:       { es: 'Escribe tu respuesta...', en: 'Type your answer...', pt: 'Digite sua resposta...', fr: 'Écrivez votre réponse...' },
  ex_select_option: { es: '⚠️ Selecciona una opción', en: '⚠️ Select an option', pt: '⚠️ Selecione uma opção', fr: '⚠️ Sélectionnez une option' },
  ex_select_tf:     { es: '⚠️ Selecciona Verdadero o Falso', en: '⚠️ Select True or False', pt: '⚠️ Selecione Verdadeiro ou Falso', fr: '⚠️ Sélectionnez Vrai ou Faux' },
  ex_write_answer:  { es: '⚠️ Escribe tu respuesta', en: '⚠️ Write your answer', pt: '⚠️ Escreva sua resposta', fr: '⚠️ Écrivez votre réponse' },
  ex_answered:      { es: 'respondidas',             en: 'answered',              pt: 'respondidas',           fr: 'répondues' },
  ex_btn_correct:   { es: '✅ Correcto',             en: '✅ Correct',            pt: '✅ Correto',             fr: '✅ Correct' },
  ex_btn_incorrect: { es: '❌ Incorrecto',           en: '❌ Incorrect',           pt: '❌ Incorreto',           fr: '❌ Incorrect' },
  ex_excellent:     { es: '¡Excelente!',             en: 'Excellent!',            pt: 'Excelente!',            fr: 'Excellent!' },
  ex_keep_going:    { es: '¡Sigue practicando!',    en: 'Keep practicing!',      pt: 'Continue praticando!',  fr: 'Continuez à pratiquer!' },
  ex_good_job:      { es: '¡Buen trabajo!',         en: 'Good job!',             pt: 'Bom trabalho!',         fr: 'Bon travail!' },
  ex_very_good:     { es: '¡Muy bien!',             en: 'Very good!',            pt: 'Muito bem!',            fr: 'Très bien!' },
  ex_keep_sub:      { es: 'Repasa un poco más y lo lograrás.', en: 'Review a bit more and you\'ll get it.', pt: 'Revise um pouco mais e conseguirá.', fr: 'Révisez un peu plus et vous y arriverez.' },
  ex_good_sub:      { es: 'Vas por buen camino, sigue así.', en: 'You\'re on the right track, keep going.', pt: 'Está no caminho certo, continue.', fr: 'Vous êtes sur la bonne voie, continuez.' },
  ex_vgood_sub:     { es: '¡Casi perfecto!',        en: 'Almost perfect!',       pt: 'Quase perfeito!',       fr: 'Presque parfait!' },
  ex_master_sub:    { es: '¡Dominas este tema!',    en: 'You\'ve mastered this!', pt: 'Você domina este tema!', fr: 'Vous maîtrisez ce sujet!' },
  ex_accuracy:      { es: 'de aciertos',            en: 'accuracy',              pt: 'de acertos',            fr: 'de réussite' },
  ex_retry:         { es: '🔄 Intentar de nuevo',   en: '🔄 Try again',          pt: '🔄 Tentar novamente',   fr: '🔄 Réessayer' },
  ex_new:           { es: '🆕 Nuevos ejercicios',   en: '🆕 New exercises',      pt: '🆕 Novos exercícios',   fr: '🆕 Nouveaux exercices' },
  ex_all_subjects:  { es: '📚 Todas las materias',  en: '📚 All subjects',       pt: '📚 Todas as matérias',  fr: '📚 Toutes les matières' },
  ex_no_data:       { es: '⚠️ Escribe algo en tu diario primero para que la IA pueda crear ejercicios.', en: '⚠️ Write something in your diary first so the AI can create exercises.', pt: '⚠️ Escreva algo no seu diário primeiro para a IA criar exercícios.', fr: '⚠️ Écrivez d\'abord dans votre journal pour que l\'IA puisse créer des exercices.' },
  ex_gen_error:     { es: '⚠️ Error al generar: ',  en: '⚠️ Generation error: ', pt: '⚠️ Erro ao gerar: ',    fr: '⚠️ Erreur de génération: ' },
  ex_generating:    { es: 'Generando...',            en: 'Generating...',         pt: 'Gerando...',            fr: 'Génération...' },

  // ---- GRAPHS ----
  graph_title:      { es: 'IA Gráficos',            en: 'AI Charts',             pt: 'IA Gráficos',           fr: 'IA Graphiques' },
  graph_tell_me:    { es: 'Dime qué quieres ver',   en: 'Tell me what you want', pt: 'Diga o que quer ver',   fr: 'Dites-moi ce que vous voulez' },
  graph_welcome:    { es: '¡Hola! Puedo crear gráficos y dibujar figuras geométricas. Prueba:', en: 'Hello! I can create charts and draw geometric shapes. Try:', pt: 'Olá! Posso criar gráficos e desenhar figuras geométricas. Tente:', fr: 'Bonjour! Je peux créer des graphiques et dessiner des formes géométriques. Essayez:' },
  graph_by_subject: { es: 'Aprendizajes por materia', en: 'Learnings by subject', pt: 'Aprendizados por matéria', fr: 'Apprentissages par matière' },
  graph_pie:        { es: 'Gráfico circular',       en: 'Pie chart',             pt: 'Gráfico circular',      fr: 'Graphique circulaire' },
  graph_shapes:     { es: '📐 Figuras geométricas:', en: '📐 Geometric shapes:', pt: '📐 Figuras geométricas:', fr: '📐 Formes géométriques:' },
  graph_input_ph:   { es: 'Pide un gráfico...',     en: 'Ask for a chart...',    pt: 'Peça um gráfico...',    fr: 'Demandez un graphique...' },
  graph_waiting:    { es: 'Esperando gráfico...',    en: 'Waiting for chart...',  pt: 'Esperando gráfico...',  fr: 'En attente du graphique...' },
  graph_save:       { es: '💾 Guardar',              en: '💾 Save',               pt: '💾 Salvar',             fr: '💾 Enregistrer' },
  graph_clear:      { es: '🗑️ Limpiar',             en: '🗑️ Clear',             pt: '🗑️ Limpar',            fr: '🗑️ Effacer' },
  graph_placeholder:{ es: 'Pide un gráfico a la IA y aparecerá aquí', en: 'Ask the AI for a chart and it will appear here', pt: 'Peça um gráfico à IA e aparecerá aqui', fr: 'Demandez un graphique à l\'IA et il apparaîtra ici' },

  // ---- PARENTS ----
  parents_title:    { es: 'Panel de Padres',        en: 'Parents Panel',         pt: 'Painel dos Pais',       fr: 'Panneau des Parents' },
  parents_sub:      { es: 'Revisa el progreso de tu hijo/a', en: 'Check your child\'s progress', pt: 'Veja o progresso do seu filho/a', fr: 'Consultez les progrès de votre enfant' },
  parents_access:   { es: '🔐 Acceso para Padres',  en: '🔐 Parent Access',      pt: '🔐 Acesso para Pais',   fr: '🔐 Accès Parents' },
  parents_enter_code: { es: 'Ingresa el código de tu hijo/a para ver su progreso:', en: 'Enter your child\'s code to see their progress:', pt: 'Insira o código do seu filho/a para ver o progresso:', fr: 'Entrez le code de votre enfant pour voir ses progrès:' },
  parents_code_ph:  { es: 'Código del estudiante...', en: 'Student code...',     pt: 'Código do estudante...', fr: 'Code de l\'élève...' },
  parents_view:     { es: 'Ver Progreso 👀',        en: 'View Progress 👀',      pt: 'Ver Progresso 👀',      fr: 'Voir Progrès 👀' },
  parents_hint:     { es: '💡 El estudiante puede generar su código desde "Mi Diario" → "Compartir con padres"', en: '💡 The student can generate their code from "My Diary" → "Share with parents"', pt: '💡 O estudante pode gerar seu código em "Meu Diário" → "Compartilhar com pais"', fr: '💡 L\'élève peut générer son code depuis "Mon Journal" → "Partager avec les parents"' },
  parents_entries:  { es: '📖 Últimas entradas del diario', en: '📖 Latest diary entries', pt: '📖 Últimas entradas do diário', fr: '📖 Dernières entrées du journal' },
  parents_ex:       { es: '✏️ Resultados de ejercicios', en: '✏️ Exercise results', pt: '✏️ Resultados de exercícios', fr: '✏️ Résultats d\'exercices' },
  parents_no_entries: { es: 'Sin entradas aún',     en: 'No entries yet',        pt: 'Sem entradas ainda',    fr: 'Pas encore d\'entrées' },
  parents_no_ex:    { es: 'Sin ejercicios realizados aún', en: 'No exercises completed yet', pt: 'Sem exercícios realizados ainda', fr: 'Pas encore d\'exercices réalisés' },
  parents_exit:     { es: '← Salir del panel',      en: '← Exit panel',          pt: '← Sair do painel',      fr: '← Quitter le panneau' },
  parents_code_empty: { es: '⚠️ Escribe el código del estudiante', en: '⚠️ Enter the student code', pt: '⚠️ Digite o código do estudante', fr: '⚠️ Entrez le code de l\'élève' },
  parents_code_bad:   { es: '❌ Código no encontrado. Pide a tu hijo/a que genere uno nuevo.', en: '❌ Code not found. Ask your child to generate a new one.', pt: '❌ Código não encontrado. Peça ao seu filho/a para gerar um novo.', fr: '❌ Code non trouvé. Demandez à votre enfant d\'en générer un nouveau.' },
  parents_welcome:  { es: '✅ ¡Bienvenido/a!',     en: '✅ Welcome!',            pt: '✅ Bem-vindo/a!',        fr: '✅ Bienvenue!' },
  parents_data_err: { es: '❌ Error al leer los datos', en: '❌ Error reading data', pt: '❌ Erro ao ler os dados', fr: '❌ Erreur de lecture des données' },
  parents_code_title: { es: 'Código para tus Padres', en: 'Code for your Parents', pt: 'Código para seus Pais', fr: 'Code pour vos Parents' },
  parents_code_sub: { es: 'Comparte este código con tus padres. Ellos lo ingresan en la sección "Padres" para ver tu progreso.', en: 'Share this code with your parents. They enter it in the "Parents" section to see your progress.', pt: 'Compartilhe este código com seus pais. Eles digitam na seção "Pais" para ver seu progresso.', fr: 'Partagez ce code avec vos parents. Ils le saisissent dans la section "Parents" pour voir vos progrès.' },
  parents_copy:     { es: '📋 Copiar código',       en: '📋 Copy code',          pt: '📋 Copiar código',      fr: '📋 Copier le code' },
  parents_code_note: { es: 'El código se guarda en este dispositivo. Si borras datos del navegador, genera uno nuevo.', en: 'The code is saved on this device. If you clear browser data, generate a new one.', pt: 'O código é salvo neste dispositivo. Se limpar os dados do navegador, gere um novo.', fr: 'Le code est enregistré sur cet appareil. Si vous effacez les données du navigateur, générez-en un nouveau.' },
  stat_entries:     { es: '📝 Entradas',            en: '📝 Entries',            pt: '📝 Entradas',           fr: '📝 Entrées' },
  stat_subjects:    { es: '📚 Materias activas',    en: '📚 Active subjects',    pt: '📚 Matérias ativas',    fr: '📚 Matières actives' },
  stat_active_days: { es: '📅 Días activos',        en: '📅 Active days',        pt: '📅 Dias ativos',        fr: '📅 Jours actifs' },
  stat_avg_ex:      { es: '✏️ Prom. ejercicios',    en: '✏️ Avg. exercises',     pt: '✏️ Média exercícios',   fr: '✏️ Moy. exercices' },

  // ---- GAMIFICATION ----
  gm_new_badge:     { es: '¡Nueva insignia!',      en: 'New badge!',            pt: 'Nova insígnia!',        fr: 'Nouveau badge!' },
  gm_streak:        { es: 'Racha:',                 en: 'Streak:',               pt: 'Sequência:',            fr: 'Série:' },
  gm_next_level:    { es: 'Siguiente:',             en: 'Next:',                 pt: 'Próximo:',              fr: 'Suivant:' },
  gm_max_level:     { es: '¡Nivel máximo!',         en: 'Max level!',            pt: 'Nível máximo!',         fr: 'Niveau maximum!' },
  gm_badges:        { es: 'Insignias',              en: 'Badges',                pt: 'Insígnias',             fr: 'Badges' },
  gm_view_badges:   { es: 'Ver insignias',          en: 'View badges',           pt: 'Ver insígnias',         fr: 'Voir les badges' },

  // ---- BADGE NAMES ----
  badge_first_entry: { es: 'Primera Entrada', en: 'First Entry', pt: 'Primeira Entrada', fr: 'Première Entrée' },
  badge_writer:      { es: 'Escritor', en: 'Writer', pt: 'Escritor', fr: 'Écrivain' },
  badge_author:      { es: 'Autor', en: 'Author', pt: 'Autor', fr: 'Auteur' },
  badge_streak3:     { es: 'Racha de 3', en: '3-Day Streak', pt: 'Sequência de 3', fr: 'Série de 3' },
  badge_streak7:     { es: 'Semana Perfecta', en: 'Perfect Week', pt: 'Semana Perfeita', fr: 'Semaine Parfaite' },
  badge_streak30:    { es: 'Mes Imparable', en: 'Unstoppable Month', pt: 'Mês Imparável', fr: 'Mois Imbattable' },
  badge_quiz_ace:    { es: 'As del Quiz', en: 'Quiz Ace', pt: 'Ás do Quiz', fr: 'As du Quiz' },
  badge_multi:       { es: 'Multidisciplina', en: 'Multi-discipline', pt: 'Multidisciplina', fr: 'Multidiscipline' },
  badge_ai_friend:   { es: 'Amigo de IA', en: 'AI Friend', pt: 'Amigo da IA', fr: 'Ami de l\'IA' },
  badge_artist:      { es: 'Artista Geométrico', en: 'Geometry Artist', pt: 'Artista Geométrico', fr: 'Artiste Géométrique' },

  // ---- BADGE DESCRIPTIONS ----
  badge_desc_first:  { es: 'Escribe tu primera entrada', en: 'Write your first entry', pt: 'Escreva sua primeira entrada', fr: 'Écrivez votre première entrée' },
  badge_desc_5:      { es: 'Escribe 5 entradas', en: 'Write 5 entries', pt: 'Escreva 5 entradas', fr: 'Écrivez 5 entrées' },
  badge_desc_20:     { es: 'Escribe 20 entradas', en: 'Write 20 entries', pt: 'Escreva 20 entradas', fr: 'Écrivez 20 entrées' },
  badge_desc_s3:     { es: '3 días seguidos escribiendo', en: '3 consecutive days writing', pt: '3 dias seguidos escrevendo', fr: '3 jours consécutifs d\'écriture' },
  badge_desc_s7:     { es: '7 días seguidos escribiendo', en: '7 consecutive days writing', pt: '7 dias seguidos escrevendo', fr: '7 jours consécutifs d\'écriture' },
  badge_desc_s30:    { es: '30 días seguidos escribiendo', en: '30 consecutive days writing', pt: '30 dias seguidos escrevendo', fr: '30 jours consécutifs d\'écriture' },
  badge_desc_quiz:   { es: 'Saca 100% en un ejercicio', en: 'Get 100% on an exercise', pt: 'Tire 100% em um exercício', fr: 'Obtenez 100% à un exercice' },
  badge_desc_multi:  { es: 'Escribe en 5 materias distintas', en: 'Write in 5 different subjects', pt: 'Escreva em 5 matérias diferentes', fr: 'Écrivez dans 5 matières différentes' },
  badge_desc_ai:     { es: 'Envía 10 mensajes a la IA', en: 'Send 10 messages to AI', pt: 'Envie 10 mensagens à IA', fr: 'Envoyez 10 messages à l\'IA' },
  badge_desc_art:    { es: 'Dibuja 5 figuras', en: 'Draw 5 shapes', pt: 'Desenhe 5 figuras', fr: 'Dessinez 5 formes' },

  // ---- LEVEL NAMES ----
  level_novice:      { es: 'Novato', en: 'Novice', pt: 'Novato', fr: 'Novice' },
  level_apprentice:  { es: 'Aprendiz', en: 'Apprentice', pt: 'Aprendiz', fr: 'Apprenti' },
  level_studious:    { es: 'Estudioso', en: 'Studious', pt: 'Estudioso', fr: 'Studieux' },
  level_dedicated:   { es: 'Dedicado', en: 'Dedicated', pt: 'Dedicado', fr: 'Dévoué' },
  level_expert:      { es: 'Experto', en: 'Expert', pt: 'Especialista', fr: 'Expert' },
  level_master:      { es: 'Maestro', en: 'Master', pt: 'Mestre', fr: 'Maître' },
  level_genius:      { es: 'Genio', en: 'Genius', pt: 'Gênio', fr: 'Génie' },
  level_legend:      { es: 'Leyenda', en: 'Legend', pt: 'Lenda', fr: 'Légende' },

  // ---- TOASTS / MISC ----
  toast_entry_saved: { es: '✅ ¡Aprendizaje guardado!', en: '✅ Learning saved!', pt: '✅ Aprendizado salvo!', fr: '✅ Apprentissage enregistré!' },
  toast_write_sth:   { es: '✏️ Escribe algo que hayas aprendido', en: '✏️ Write something you learned', pt: '✏️ Escreva algo que aprendeu', fr: '✏️ Écrivez ce que vous avez appris' },
  toast_entry_del:   { es: '🗑️ Aprendizaje eliminado', en: '🗑️ Learning deleted', pt: '🗑️ Aprendizado removido', fr: '🗑️ Apprentissage supprimé' },
  toast_subject_name: { es: '✏️ Escribe el nombre de la materia', en: '✏️ Enter the subject name', pt: '✏️ Digite o nome da matéria', fr: '✏️ Entrez le nom de la matière' },
  toast_subject_dup: { es: '⚠️ Ya tienes esa materia', en: '⚠️ You already have that subject', pt: '⚠️ Você já tem essa matéria', fr: '⚠️ Vous avez déjà cette matière' },
  toast_subject_added: { es: '✅ ¡{name} agregada!', en: '✅ {name} added!', pt: '✅ {name} adicionada!', fr: '✅ {name} ajoutée!' },
  toast_base_subject: { es: '⚠️ No puedes eliminar una materia base', en: '⚠️ You cannot delete a base subject', pt: '⚠️ Não pode remover uma matéria base', fr: '⚠️ Vous ne pouvez pas supprimer une matière de base' },
  toast_subject_del: { es: '🗑️ {name} eliminada', en: '🗑️ {name} deleted', pt: '🗑️ {name} removida', fr: '🗑️ {name} supprimée' },
  toast_complete_all: { es: '⚠️ Completa todos los campos', en: '⚠️ Fill in all fields', pt: '⚠️ Preencha todos os campos', fr: '⚠️ Remplissez tous les champs' },
  toast_pass_mismatch: { es: '⚠️ Las contraseñas no coinciden', en: '⚠️ Passwords don\'t match', pt: '⚠️ As senhas não coincidem', fr: '⚠️ Les mots de passe ne correspondent pas' },
  toast_pass_short: { es: '⚠️ Mínimo 4 caracteres', en: '⚠️ Minimum 4 characters', pt: '⚠️ Mínimo 4 caracteres', fr: '⚠️ Minimum 4 caractères' },
  toast_name_exists: { es: '⚠️ Ese nombre ya existe', en: '⚠️ That name already exists', pt: '⚠️ Esse nome já existe', fr: '⚠️ Ce nom existe déjà' },
  toast_welcome:     { es: '🎉 ¡Bienvenido, {name}!', en: '🎉 Welcome, {name}!', pt: '🎉 Bem-vindo, {name}!', fr: '🎉 Bienvenue, {name}!' },
  toast_login_fail:  { es: '❌ Nombre o contraseña incorrectos', en: '❌ Wrong name or password', pt: '❌ Nome ou senha incorretos', fr: '❌ Nom ou mot de passe incorrect' },
  toast_hello:       { es: '👋 ¡Hola, {name}!',    en: '👋 Hello, {name}!',     pt: '👋 Olá, {name}!',       fr: '👋 Bonjour, {name}!' },
  toast_goodbye:     { es: '👋 ¡Hasta pronto!',    en: '👋 See you soon!',      pt: '👋 Até logo!',           fr: '👋 À bientôt!' },
  toast_login_first: { es: '⚠️ Inicia sesión primero', en: '⚠️ Sign in first', pt: '⚠️ Entre primeiro', fr: '⚠️ Connectez-vous d\'abord' },
  toast_code_copied: { es: '✅ Código copiado',     en: '✅ Code copied',         pt: '✅ Código copiado',      fr: '✅ Code copié' },
  toast_entry_copied: { es: '✅ Entrada copiada',   en: '✅ Entry copied',        pt: '✅ Entrada copiada',     fr: '✅ Entrée copiée' },
  toast_pdf_ready:   { es: '📄 PDF listo — usa Ctrl+P para guardar', en: '📄 PDF ready — use Ctrl+P to save', pt: '📄 PDF pronto — use Ctrl+P para salvar', fr: '📄 PDF prêt — utilisez Ctrl+P pour enregistrer' },
  toast_voice_no:    { es: '⚠️ Tu navegador no soporta entrada por voz', en: '⚠️ Your browser doesn\'t support voice input', pt: '⚠️ Seu navegador não suporta entrada por voz', fr: '⚠️ Votre navigateur ne prend pas en charge la saisie vocale' },
  toast_listening:   { es: '🎤 Escuchando... habla ahora', en: '🎤 Listening... speak now', pt: '🎤 Ouvindo... fale agora', fr: '🎤 Écoute... parlez maintenant' },
  toast_voice_err:   { es: '⚠️ Error de voz: ',    en: '⚠️ Voice error: ',      pt: '⚠️ Erro de voz: ',      fr: '⚠️ Erreur vocale: ' },
  confirm_del_entry: { es: '¿Seguro que quieres borrar este aprendizaje?', en: 'Are you sure you want to delete this learning?', pt: 'Tem certeza que quer apagar este aprendizado?', fr: 'Êtes-vous sûr de vouloir supprimer cet apprentissage?' },
  confirm_del_subj:  { es: '¿Eliminar "{name}" y todos sus aprendizajes?', en: 'Delete "{name}" and all its learnings?', pt: 'Apagar "{name}" e todos seus aprendizados?', fr: 'Supprimer "{name}" et tous ses apprentissages?' },

  // ---- CALENDAR ----
  cal_title:        { es: '📅 Mi Actividad',       en: '📅 My Activity',        pt: '📅 Minha Atividade',    fr: '📅 Mon Activité' },
  cal_entries:      { es: 'entradas',               en: 'entries',               pt: 'entradas',              fr: 'entrées' },
  cal_entry:        { es: 'entrada',                en: 'entry',                 pt: 'entrada',               fr: 'entrée' },
  cal_active_days:  { es: 'días activos',           en: 'active days',           pt: 'dias ativos',           fr: 'jours actifs' },
  cal_in_weeks:     { es: 'entradas en {n} semanas', en: 'entries in {n} weeks', pt: 'entradas em {n} semanas', fr: 'entrées en {n} semaines' },
  cal_less:         { es: 'Menos',                  en: 'Less',                  pt: 'Menos',                 fr: 'Moins' },
  cal_more:         { es: 'Más',                    en: 'More',                  pt: 'Mais',                  fr: 'Plus' },

  // ---- PDF ----
  pdf_title:        { es: 'Mi Diario Escolar',     en: 'My School Diary',       pt: 'Meu Diário Escolar',   fr: 'Mon Journal Scolaire' },
  pdf_student:      { es: 'Estudiante:',            en: 'Student:',              pt: 'Estudante:',            fr: 'Élève:' },
  pdf_level:        { es: 'Nivel:',                 en: 'Level:',                pt: 'Nível:',                fr: 'Niveau:' },
  pdf_entries:      { es: 'Entradas',               en: 'Entries',               pt: 'Entradas',              fr: 'Entrées' },
  pdf_subjects:     { es: 'Materias',               en: 'Subjects',              pt: 'Matérias',              fr: 'Matières' },
  pdf_streak:       { es: 'Racha (días)',            en: 'Streak (days)',         pt: 'Sequência (dias)',      fr: 'Série (jours)' },
  pdf_badges:       { es: 'Insignias',               en: 'Badges',               pt: 'Insígnias',             fr: 'Badges' },
  pdf_gen:          { es: 'Generado el',             en: 'Generated on',          pt: 'Gerado em',             fr: 'Généré le' },

  // ---- XP REASONS ----
  xp_diary_entry:   { es: 'Entrada en diario',     en: 'Diary entry',           pt: 'Entrada no diário',     fr: 'Entrée journal' },
  xp_ai_entry:      { es: 'Entrada con IA',        en: 'AI entry',              pt: 'Entrada com IA',        fr: 'Entrée avec IA' },
  xp_ai_chat:       { es: 'Chat con IA',           en: 'AI chat',               pt: 'Chat com IA',           fr: 'Chat avec IA' },
  xp_shape:         { es: 'Figura dibujada',        en: 'Shape drawn',           pt: 'Figura desenhada',      fr: 'Forme dessinée' },
  xp_exercise:      { es: 'Ejercicio completado',   en: 'Exercise completed',    pt: 'Exercício completado',  fr: 'Exercice complété' },

  // ---- BASE SUBJECTS ----
  subj_language:    { es: 'Lenguaje',               en: 'Language Arts',         pt: 'Linguagem',             fr: 'Français' },
  subj_math:        { es: 'Matemáticas',             en: 'Mathematics',           pt: 'Matemática',            fr: 'Mathématiques' },
  subj_history:     { es: 'Historia',                en: 'History',               pt: 'História',              fr: 'Histoire' },

  // ---- WHATSAPP ----
  wa_msg:           { es: '👨‍👩‍👧 ¡Hola! Puedes ver mi progreso escolar:\n\n1. Entra a: {url}\n2. Ve a la sección "Padres"\n3. Ingresa este código: *{code}*\n\n📚 Mi Diario Escolar + IA', en: '👨‍👩‍👧 Hello! You can see my school progress:\n\n1. Go to: {url}\n2. Go to the "Parents" section\n3. Enter this code: *{code}*\n\n📚 My School Diary + AI', pt: '👨‍👩‍👧 Olá! Você pode ver meu progresso escolar:\n\n1. Acesse: {url}\n2. Vá à seção "Pais"\n3. Insira este código: *{code}*\n\n📚 Meu Diário Escolar + IA', fr: '👨‍👩‍👧 Bonjour! Vous pouvez voir mes progrès scolaires:\n\n1. Allez sur: {url}\n2. Allez à la section "Parents"\n3. Entrez ce code: *{code}*\n\n📚 Mon Journal Scolaire + IA' },

  // ---- ERROR MESSAGES ----
  err_ollama:       { es: '⚠️ No se pudo conectar con Ollama', en: '⚠️ Could not connect to Ollama', pt: '⚠️ Não foi possível conectar ao Ollama', fr: '⚠️ Impossible de se connecter à Ollama' },
  err_ollama_sub:   { es: 'Parece que Ollama no está corriendo.', en: 'It seems Ollama is not running.', pt: 'Parece que o Ollama não está rodando.', fr: 'Il semble qu\'Ollama ne fonctionne pas.' },
  err_cors:         { es: '⚠️ Error de CORS', en: '⚠️ CORS Error', pt: '⚠️ Erro de CORS', fr: '⚠️ Erreur CORS' },
  err_generic:      { es: '⚠️ Error', en: '⚠️ Error', pt: '⚠️ Erro', fr: '⚠️ Erreur' },

  // ---- LANGUAGE ----
  lang_label:       { es: '🌐 Idioma',              en: '🌐 Language',           pt: '🌐 Idioma',             fr: '🌐 Langue' },
};

function t(key, params) {
  const entry = I18N[key];
  if (!entry) return key;
  let text = entry[currentLang] || entry.es || key;
  if (params) {
    Object.keys(params).forEach(k => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
    });
  }
  return text;
}

function setLang(lang) {
  if (!LANGS[lang]) return;
  currentLang = lang;
  localStorage.setItem('app_lang', lang);
  applyLang();
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr');
    if (attr === 'placeholder') el.placeholder = t(key);
    else if (attr === 'title') el.title = t(key);
    else el.innerHTML = t(key);
  });

  document.documentElement.lang = currentLang;
  
  if (typeof render === 'function' && typeof state !== 'undefined' && state.currentUser !== undefined) {
    render();
  }
  if (typeof aiNewChat === 'function') {
    // Refresh AI welcome if visible
    const welcome = document.querySelector('.ai-welcome-msg');
    if (welcome) {
      const iaLabel = (typeof ollamaAvailable !== 'undefined' && ollamaAvailable) ? t('ai_local_label') : ((typeof getGroqKey === 'function' && getGroqKey()) ? t('ai_cloud_label') : t('ai_label'));
      welcome.querySelector('h2').textContent = t('ai_hello', { type: iaLabel });
      welcome.querySelector('p').textContent = t('ai_welcome_msg');
    }
  }

  // Update voice recognition language
  const voiceLangs = { es: 'es-ES', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR' };
  if (typeof voiceRecognition !== 'undefined' && voiceRecognition) {
    voiceRecognition.lang = voiceLangs[currentLang] || 'es-ES';
  }
  window._voiceLang = voiceLangs[currentLang] || 'es-ES';

  // Update formatDate locale
  window._dateLang = { es: 'es-MX', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR' }[currentLang] || 'es-MX';
}

function buildLangSelector() {
  const container = document.createElement('div');
  container.className = 'lang-selector';
  container.innerHTML = `
    <button class="lang-btn" onclick="toggleLangMenu()" title="${t('lang_label')}">
      ${LANGS[currentLang].flag}
    </button>
    <div class="lang-menu hidden" id="lang-menu">
      ${Object.entries(LANGS).map(([code, { flag, name }]) =>
        `<button class="lang-option ${code === currentLang ? 'active' : ''}" onclick="setLang('${code}')">${flag} ${name}</button>`
      ).join('')}
    </div>
  `;
  return container;
}

function toggleLangMenu() {
  const menu = document.getElementById('lang-menu');
  if (menu) menu.classList.toggle('hidden');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('lang-menu');
  if (menu && !e.target.closest('.lang-selector')) menu.classList.add('hidden');
});
