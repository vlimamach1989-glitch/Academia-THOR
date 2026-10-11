      // CONTROLE DE ABAS
        function switchTab(tabId) {
            const tab = document.getElementById('tab-' + tabId);
            if (!tab) return;

            const menuItems = document.querySelectorAll('.menu-list li');

            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            menuItems.forEach(el => el.classList.remove('active'));

            tab.classList.add('active');
            const activeItem = [...menuItems].find(item => item.dataset.tab === tabId);
            if (activeItem) activeItem.classList.add('active');
        }

        function toggleMenu() {
            const sidebar = document.querySelector('.admin-layout aside');
            const toggle = document.querySelector('.menu-toggle');
            if (!sidebar || !toggle) return;

            const isCollapsed = sidebar.classList.toggle('menu-collapsed');
            toggle.setAttribute('aria-expanded', String(!isCollapsed));
            toggle.setAttribute('aria-label', isCollapsed ? 'Expandir menu' : 'Recolher menu');
        }

        function togglePasswordVisibility() {
            const passwordInput = document.getElementById('pass');
            const toggle = document.querySelector('.password-toggle');
            if (!passwordInput || !toggle) return;

            const isVisible = passwordInput.type === 'text';
            passwordInput.type = isVisible ? 'password' : 'text';
            toggle.setAttribute('aria-pressed', String(!isVisible));
            toggle.setAttribute('aria-label', isVisible ? 'Mostrar senha' : 'Ocultar senha');
        }

        // LOGIN SIMPLES
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const u = document.getElementById('user').value;
                const p = document.getElementById('pass').value;
                if (u === 'admin' && p === 'admin') {
                    document.getElementById('login-screen').style.display = 'none';
                    document.getElementById('admin-panel').style.display = 'block';
                    carregarTudo();
                } else {
                    alert('Usuário ou senha incorretos! (Use admin / admin)');
                }
            });
        }

        function logout() {
            document.getElementById('admin-panel').style.display = 'none';
            document.getElementById('login-screen').style.display = 'flex';
        }

        // BANCO DE DADOS LOCAL (LOCALSTORAGE)
        const getDB = (key) => JSON.parse(localStorage.getItem(key)) || [];
        const saveDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));

        // CONTROLE VISUAL DO ATESTADO CONDICIONAL
        function toggleAtestadoFields() {
            const checkbox = document.getElementById('atestado-apresentado');
            const camposAtestado = document.getElementById('campos-atestado');

            if (checkbox && camposAtestado) {
                if (checkbox.checked) {
                    camposAtestado.style.display = 'grid';
                } else {
                    camposAtestado.style.display = 'none';
                    document.getElementById('aluno-atestado-val').value = '';
                    document.getElementById('aluno-foto-atestado').value = '';
                }
            }
        }
        // 2, 3 & 4. ALUNOS (Com Foto, Múltiplas Atividades e Atestado Condicional)
        const formAluno = document.getElementById('form-aluno');
        if (formAluno) {
            formAluno.addEventListener('submit', (e) => {
                e.preventDefault();
                const alunos = getDB('alunos');

                const atestadoSim = document.getElementById('atestado-apresentado').checked;
                const fotoInput = document.getElementById('aluno-foto');
                const atestadoFotoInput = document.getElementById('aluno-foto-atestado');

                // Função auxiliar para converter arquivos em URL base64 (para salvar no localStorage)
                const processFile = (fileInput, callback) => {
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function (uploadE) {
                            callback(uploadE.target.result);
                        };
                        reader.readAsDataURL(fileInput.files[0]);
                    } else {
                        callback('');
                    }
                };

                processFile(fotoInput, (fotoUrl) => {
                    processFile(atestadoFotoInput, (atestadoUrl) => {
                        const novo = {
                            id: Date.now(),
                            nome: document.getElementById('aluno-nome').value,
                            doc: document.getElementById('aluno-doc').value,
                            tel: document.getElementById('aluno-tel').value,
                            end: document.getElementById('aluno-end').value,
                            foto: fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                            atividades: Array.from(document.querySelectorAll('input[name="aluno-atividades"]:checked')).map(el => el.value),
                            atestadoSim: atestadoSim,
                            atestadoVal: atestadoSim ? document.getElementById('aluno-atestado-val').value : '',
                            atestadoAnexo: atestadoUrl
                        };

                        alunos.push(novo);
                        saveDB('alunos', alunos);

                        // Reseta o formulário e esconde os campos condicionais do atestado
                        e.target.reset();
                        document.getElementById('campos-atestado').style.display = 'none';

                        // Desmarca todos os checkboxes de atividades explicitamente
                        document.querySelectorAll('input[name="aluno-atividades"]').forEach(cb => cb.checked = false);

                        renderAlunos();
                        alert('Aluno cadastrado com sucesso!');
                    });
                });
            });
        }

        function renderAlunos() {
            const alunos = getDB('alunos');
            const tbody = document.getElementById('tabela-alunos-body');
            tbody.innerHTML = '';

            alunos.forEach(a => {
                tbody.innerHTML += `
                    <tr>
                        <td>
                            <img src="${a.foto}" alt="Foto" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary-color, #f39c12);">
                        </td>
                        <td><b>${a.nome}</b><br><small>${a.doc}</small></td>
                        <td>${a.tel}<br><small>${a.end}</small></td>
                        <td><span class="badge" style="background: rgba(243, 156, 18, 0.15); color: var(--primary-color, #f39c12); padding: 3px 8px; border-radius: 4px;">${a.plano || 'Não informado'}</span></td>
                        <td>
                            ${a.atestadoSim ? `<span style="color: #2ecc71;">✅ Apresentado</span><br><small>Val: ${a.atestadoVal || 'N/A'}</small>` : `<span style="color: #e74c3c;">❌ Pendente</span>`}
                        </td>
                        <td class="actions-cell">
                            <button class="btn btn-danger" onclick="deletarAluno(${a.id})">Excluir</button>
                        </td>
                    </tr>
                `;
            });
        }

        function deletarAluno(id) {
            if (confirm('Deseja realmente deletar este aluno?')) {
                let alunos = getDB('alunos').filter(a => a.id !== id);
                saveDB('alunos', alunos);
                renderAlunos();
            }
        }

        // 5. PLANOS
        const formPlano = document.getElementById('form-plano');
        if (formPlano) {
            formPlano.addEventListener('submit', (e) => {
                e.preventDefault();
                const planos = getDB('planos');
                planos.push({
                    id: Date.now(),
                    nome: document.getElementById('plano-nome').value,
                    valor: document.getElementById('plano-valor').value,
                    desc: document.getElementById('plano-desc').value
                });
                saveDB('planos', planos);
                e.target.reset();
                renderPlanos();
            });
        }

        function renderPlanos() {
            const planos = getDB('planos');
            const container = document.getElementById('lista-planos');
            if (!container) return;
            container.innerHTML = planos.map(p => `
                <div style="background:#f8fafc; padding:1rem; margin-bottom:0.5rem; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><b>${p.nome}</b> - R$ ${p.valor}<br><small>${p.desc}</small></div>
                    <button class="btn btn-danger" onclick="removerItem('planos', ${p.id}, renderPlanos)">Remover</button>
                </div>
            `).join('');
        }

        // 6. AULAS
        const formAula = document.getElementById('form-aula');
        if (formAula) {
            formAula.addEventListener('submit', (e) => {
                e.preventDefault();
                const aulas = getDB('aulas');
                aulas.push({
                    id: Date.now(),
                    nome: document.getElementById('aula-nome').value,
                    horario: document.getElementById('aula-horario').value,
                    foto: document.getElementById('aula-foto').value,
                    desc: document.getElementById('aula-desc').value,
                    lancado: false
                });
                saveDB('aulas', aulas);
                e.target.reset();
                renderAulas();
            });
        }

        function renderAulas() {
            const aulas = getDB('aulas');
            const container = document.getElementById('lista-aulas');
            if (!container) return;
            container.innerHTML = aulas.map(a => `
                <div style="background:#f8fafc; padding:1rem; margin-bottom:0.5rem; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><b>${a.nome}</b> (${a.horario}) <span class="badge ${a.lancado ? 'badge-success' : 'badge-danger'}">${a.lancado ? 'No Ar' : 'Rascunho'}</span></div>
                    <div>
                        <button class="btn btn-success" onclick="lancarSite('aulas', ${a.id}, renderAulas)">${a.lancado ? 'Atualizar no Site' : 'Lançar no Site'}</button>
                        <button class="btn btn-danger" onclick="removerItem('aulas', ${a.id}, renderAulas)">Excluir</button>
                    </div>
                </div>
            `).join('');
        }

        // 7. PROFESSORES
        const formProf = document.getElementById('form-prof');
        if (formProf) {
            formProf.addEventListener('submit', (e) => {
                e.preventDefault();
                const profs = getDB('profs');
                profs.push({
                    id: Date.now(),
                    nome: document.getElementById('prof-nome').value,
                    crf: document.getElementById('prof-crf').value,
                    esp: document.getElementById('prof-esp').value,
                    desc: document.getElementById('prof-desc').value,
                    lancado: false
                });
                saveDB('profs', profs);
                e.target.reset();
                renderProfs();
            });
        }

        function renderProfs() {
            const profs = getDB('profs');
            const container = document.getElementById('lista-professores');
            if (!container) return;
            container.innerHTML = profs.map(p => `
                <div style="background:#f8fafc; padding:1rem; margin-bottom:0.5rem; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><b>${p.nome}</b> (CRF: ${p.crf}) - ${p.esp} <span class="badge ${p.lancado ? 'badge-success' : 'badge-danger'}">${p.lancado ? 'No Ar' : 'Rascunho'}</span></div>
                    <div>
                        <button class="btn btn-success" onclick="lancarSite('profs', ${p.id}, renderProfs)">${p.lancado ? 'Atualizar' : 'Lançar no Site'}</button>
                        <button class="btn btn-danger" onclick="removerItem('profs', ${p.id}, renderProfs)">Excluir</button>
                    </div>
                </div>
            `).join('');
        }

        // 8. EVENTOS
        const formEvento = document.getElementById('form-evento');
        if (formEvento) {
            formEvento.addEventListener('submit', (e) => {
                e.preventDefault();
                const eventos = getDB('eventos');
                eventos.push({
                    id: Date.now(),
                    titulo: document.getElementById('evento-titulo').value,
                    data: document.getElementById('evento-data').value,
                    desc: document.getElementById('evento-desc').value,
                    lancado: false
                });
                saveDB('eventos', eventos);
                e.target.reset();
                renderEventos();
            });
        }

        function renderEventos() {
            const eventos = getDB('eventos');
            const container = document.getElementById('lista-eventos');
            if (!container) return;
            container.innerHTML = eventos.map(ev => `
                <div style="background:#f8fafc; padding:1rem; margin-bottom:0.5rem; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><b>${ev.titulo}</b> (${ev.data}) <span class="badge ${ev.lancado ? 'badge-success' : 'badge-danger'}">${ev.lancado ? 'No Ar' : 'Rascunho'}</span></div>
                    <div>
                        <button class="btn btn-success" onclick="lancarSite('eventos', ${ev.id}, renderEventos)">${ev.lancado ? 'Atualizar' : 'Lançar no Site'}</button>
                        <button class="btn btn-danger" onclick="removerItem('eventos', ${ev.id}, renderEventos)">Excluir</button>
                    </div>
                </div>
            `).join('');
        }

        // 9. GALERIA
        const formGaleria = document.getElementById('form-galeria');
        if (formGaleria) {
            formGaleria.addEventListener('submit', (e) => {
                e.preventDefault();
                const fotos = getDB('galeria');
                fotos.push({
                    id: Date.now(),
                    titulo: document.getElementById('galeria-titulo').value,
                    url: document.getElementById('galeria-url').value,
                    lancado: false
                });
                saveDB('galeria', fotos);
                e.target.reset();
                renderGaleria();
            });
        }

        function renderGaleria() {
            const fotos = getDB('galeria');
            const container = document.getElementById('lista-galeria');
            if (!container) return;
            container.innerHTML = fotos.map(f => `
                <div style="background:#f8fafc; padding:1rem; margin-bottom:0.5rem; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><b>${f.titulo}</b> <span class="badge ${f.lancado ? 'badge-success' : 'badge-danger'}">${f.lancado ? 'No Ar' : 'Rascunho'}</span></div>
                    <div>
                        <button class="btn btn-success" onclick="lancarSite('galeria', ${f.id}, renderGaleria)">${f.lancado ? 'Atualizar' : 'Lançar no Site'}</button>
                        <button class="btn btn-danger" onclick="removerItem('galeria', ${f.id}, renderGaleria)">Excluir</button>
                    </div>
                </div>
            `).join('');
        }

        // 10. CONTATOS E REDES SOCIAIS
        const formContatos = document.getElementById('form-contatos');
        if (formContatos) {
            formContatos.addEventListener('submit', (e) => {
                e.preventDefault();
                const dados = {
                    tel: document.getElementById('empresa-tel').value,
                    email: document.getElementById('empresa-email').value,
                    end: document.getElementById('empresa-end').value,
                    insta: document.getElementById('empresa-insta').value,
                    zap: document.getElementById('empresa-zap').value
                };
                saveDB('contatos', dados);
                alert('Informações de contato salvas!');
            });
        }

        function carregarContatos() {
            const c = JSON.parse(localStorage.getItem('contatos')) || {};
            document.getElementById('empresa-tel').value = c.tel || '';
            document.getElementById('empresa-email').value = c.email || '';
            document.getElementById('empresa-end').value = c.end || '';
            document.getElementById('empresa-insta').value = c.insta || '';
            document.getElementById('empresa-zap').value = c.zap || '';
        }

        // 11. CONFIGURAR NOMES DE TREINO (A-G)
        function carregarConfigTreinos() {
            const container = document.getElementById('config-treinos-container');
            if (!container) return;
            const treinosConfig = getDB('treinosConfig');
            const fichas = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
            container.innerHTML = fichas.map(f => {
                const item = treinosConfig.find(t => t.ficha === f) || { nome: `Treino ${f}`, video: '' };
                return `
                    <div class="grid-2" style="margin-bottom:0.8rem; background:#f1f5f9; padding:0.8rem; border-radius:6px;">
                        <div class="form-group"><label>Nome Treino ${f}</label><input type="text" id="cfg-nome-${f}" value="${item.nome}"></div>
                        <div class="form-group"><label>URL Vídeo Explicativo</label><input type="text" id="cfg-video-${f}" value="${item.video}" placeholder="https://youtube.com/..."></div>
                    </div>
                `;
            }).join('');
        }

        function salvarConfigTreinos() {
            const fichas = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
            const dados = fichas.map(f => ({
                ficha: f,
                nome: document.getElementById(`cfg-nome-${f}`).value,
                video: document.getElementById(`cfg-video-${f}`).value
            }));
            saveDB('treinosConfig', dados);
            alert('Configurações de treino salvas com sucesso!');
        }

        // 12. TREINOS CURINGA
        const formTreinoPadrao = document.getElementById('form-treino-padrao');
        if (formTreinoPadrao) {
            formTreinoPadrao.addEventListener('submit', (e) => {
                e.preventDefault();
                const tp = getDB('treinosPadrao');
                tp.push({
                    id: Date.now(),
                    nome: document.getElementById('tp-nome').value,
                    grupo: document.getElementById('tp-grupo').value,
                    exercicios: document.getElementById('tp-exercicios').value
                });
                saveDB('treinosPadrao', tp);
                e.target.reset();
                renderTreinosPadrao();
            });
        }

        function renderTreinosPadrao() {
            const tp = getDB('treinosPadrao');
            document.getElementById('lista-treinos-padrao').innerHTML = tp.map(t => `
                <div style="background:#f8fafc; padding:1rem; margin-bottom:0.5rem; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><b>${t.nome}</b> (${t.grupo})</div>
                    <button class="btn btn-danger" onclick="removerItem('treinosPadrao', ${t.id}, renderTreinosPadrao)">Excluir</button>
                </div>
            `).join('');
        }

        // UTILITÁRIOS GERAIS
        function removerItem(key, id, callback) {
            if (confirm('Tem certeza que deseja excluir?')) {
                let dados = getDB(key).filter(item => item.id !== id);
                saveDB(key, dados);
                callback();
            }
        }

        function lancarSite(key, id, callback) {
            let dados = getDB(key);
            let item = dados.find(i => i.id === id);
            if (item) {
                item.lancado = !item.lancado;
                saveDB(key, dados);
                callback();
                alert(item.lancado ? 'Publicado no site oficial com sucesso!' : 'Removido do site oficial.');
            }
        }

        function carregarTudo() {
            renderAlunos();
            renderPlanos();
            renderAulas();
            renderProfs();
            renderEventos();
            renderGaleria();
            carregarContatos();
            carregarConfigTreinos();
            renderTreinosPadrao();
        }

        function toggleDropdownAtividades() {
            const lista = document.getElementById('dropdown-lista-atividades');
            lista.classList.toggle('ativo');
        }

        // Opcional: Fecha o menu se clicar fora dele
        window.addEventListener('click', function (e) {
            if (!e.target.closest('.dropdown-atividades')) {
                const lista = document.getElementById('dropdown-lista-atividades');
                if (lista) lista.classList.remove('ativo');
            }
        });
  