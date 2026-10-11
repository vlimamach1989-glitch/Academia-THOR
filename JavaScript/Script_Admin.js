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

        function mostrarSecaoAluno(sectionId, button) {
            const section = document.getElementById(sectionId);
            if (!section) return;

            document.querySelectorAll('.student-section-panel').forEach(panel => panel.classList.remove('active'));
            document.querySelectorAll('.student-section-button').forEach(item => item.setAttribute('aria-pressed', 'false'));
            section.classList.add('active');
            if (button) button.setAttribute('aria-pressed', 'true');
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

        function normalizarBuscaAluno(value) {
            return String(value || '').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function gerarMatricula(alunos, data = new Date()) {
            const ultimoSequencial = alunos.reduce((maior, aluno) => {
                const correspondencia = String(aluno.matricula || '').match(/^\d{6}(\d+)$/);
                return correspondencia ? Math.max(maior, Number(correspondencia[1])) : maior;
            }, 0);
            const ano = String(data.getFullYear()).slice(-2);
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const dia = String(data.getDate()).padStart(2, '0');
            const sequencial = String(ultimoSequencial + 1).padStart(2, '0');
            return `${ano}${mes}${dia}${sequencial}`;
        }

        function garantirMatriculas(alunos) {
            let alterado = false;
            alunos.forEach(aluno => {
                if (/^\d{8,}$/.test(String(aluno.matricula || ''))) return;

                const idTimestamp = Number(aluno.id);
                const dataCadastro = Number.isFinite(idTimestamp) && idTimestamp > 100000000000
                    ? new Date(idTimestamp)
                    : new Date();
                aluno.matricula = gerarMatricula(alunos, dataCadastro);
                alterado = true;
            });
            if (alterado) saveDB('alunos', alunos);
        }

        function atualizarPreviewMatricula(alunos = getDB('alunos')) {
            const campoMatricula = document.getElementById('aluno-matricula');
            if (campoMatricula) campoMatricula.value = gerarMatricula(alunos);
        }

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
        let alunoEmEdicaoId = null;

        function atualizarModoFormularioAluno() {
            const titulo = document.getElementById('cadastro-aluno-title');
            const botaoSalvar = document.getElementById('btn-salvar-aluno');
            const botaoCancelar = document.getElementById('btn-cancelar-edicao-aluno');
            const editando = alunoEmEdicaoId !== null;

            if (titulo) titulo.textContent = editando ? 'Editar Cadastro do Aluno' : 'Cadastrar Novo Aluno';
            if (botaoSalvar) botaoSalvar.textContent = editando ? 'Salvar Alterações' : 'Salvar Aluno';
            if (botaoCancelar) botaoCancelar.hidden = !editando;
        }

        function limparFormularioAluno() {
            if (!formAluno) return;

            formAluno.reset();
            document.querySelectorAll('input[name="aluno-atividades"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            const camposAtestado = document.getElementById('campos-atestado');
            if (camposAtestado) camposAtestado.style.display = 'none';
            alunoEmEdicaoId = null;
            atualizarModoFormularioAluno();
            atualizarPreviewMatricula();
        }

        function cancelarEdicaoAluno() {
            limparFormularioAluno();
        }

        function editarAluno(id) {
            const aluno = getDB('alunos').find(item => item.id === id);
            if (!aluno) {
                alert('Não foi possível encontrar esse cadastro de aluno.');
                return;
            }

            switchTab('alunos');
            const botaoCadastro = document.querySelector('[aria-controls="secao-cadastro-aluno"]');
            mostrarSecaoAluno('secao-cadastro-aluno', botaoCadastro);
            alunoEmEdicaoId = aluno.id;

            document.getElementById('aluno-matricula').value = aluno.matricula || '';
            document.getElementById('aluno-nome').value = aluno.nome || '';
            document.getElementById('aluno-doc').value = aluno.doc || '';
            document.getElementById('aluno-tel').value = aluno.tel || '';
            document.getElementById('aluno-end').value = aluno.end || '';
            document.getElementById('aluno-vencimento').value = getAlunoDiaVencimento(aluno) || '';
            document.getElementById('aluno-mensalidade').value = aluno.valorMensalidade !== null
                && aluno.valorMensalidade !== undefined
                && Number.isFinite(Number(aluno.valorMensalidade))
                ? aluno.valorMensalidade
                : '';
            document.getElementById('atestado-apresentado').checked = Boolean(aluno.atestadoSim);
            document.getElementById('aluno-atestado-val').value = aluno.atestadoVal || '';
            toggleAtestadoFields();

            const atividades = Array.isArray(aluno.atividades) ? aluno.atividades : [];
            document.querySelectorAll('input[name="aluno-atividades"]').forEach(checkbox => {
                checkbox.checked = atividades.includes(checkbox.value);
            });

            atualizarModoFormularioAluno();
            formAluno.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('aluno-nome').focus();
        }

        if (formAluno) {
            formAluno.addEventListener('submit', (e) => {
                e.preventDefault();
                const alunos = getDB('alunos');
                garantirMatriculas(alunos);
                const alunoExistente = alunoEmEdicaoId === null
                    ? null
                    : alunos.find(aluno => aluno.id === alunoEmEdicaoId);

                if (alunoEmEdicaoId !== null && !alunoExistente) {
                    alert('O cadastro selecionado não foi encontrado. Atualize a lista e tente novamente.');
                    limparFormularioAluno();
                    return;
                }

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
                        reader.onerror = function () {
                            alert('Não foi possível ler o arquivo selecionado. Tente novamente.');
                        };
                        reader.readAsDataURL(fileInput.files[0]);
                    } else {
                        callback('');
                    }
                };

                processFile(fotoInput, (fotoUrl) => {
                    processFile(atestadoFotoInput, (atestadoUrl) => {
                        const novo = {
                            ...alunoExistente,
                            id: alunoExistente ? alunoExistente.id : Date.now(),
                            matricula: alunoExistente?.matricula || gerarMatricula(alunos),
                            nome: document.getElementById('aluno-nome').value,
                            doc: document.getElementById('aluno-doc').value,
                            tel: document.getElementById('aluno-tel').value,
                            end: document.getElementById('aluno-end').value,
                            diaVencimento: Number(document.getElementById('aluno-vencimento').value),
                            valorMensalidade: document.getElementById('aluno-mensalidade').value === ''
                                ? (alunoExistente?.valorMensalidade ?? null)
                                : Number(document.getElementById('aluno-mensalidade').value),
                            ultimaBaixa: alunoExistente?.ultimaBaixa || '',
                            foto: fotoUrl || alunoExistente?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                            atividades: Array.from(document.querySelectorAll('input[name="aluno-atividades"]:checked')).map(el => el.value),
                            atestadoSim: atestadoSim,
                            atestadoVal: atestadoSim ? document.getElementById('aluno-atestado-val').value : '',
                            atestadoAnexo: atestadoSim ? (atestadoUrl || alunoExistente?.atestadoAnexo || '') : ''
                        };

                        delete novo.vencimento;
                        if (alunoExistente) {
                            const indice = alunos.findIndex(aluno => aluno.id === alunoExistente.id);
                            alunos[indice] = novo;
                        } else {
                            alunos.push(novo);
                        }
                        saveDB('alunos', alunos);

                        const estavaEditando = alunoExistente !== null;
                        limparFormularioAluno();
                        renderAlunos();
                        alert(estavaEditando ? 'Cadastro do aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!');
                    });
                });
            });
        }

        function renderAlunos() {
            const alunos = getDB('alunos');
            garantirMatriculas(alunos);
            const tbody = document.getElementById('tabela-alunos-body');
            if (!tbody) return;
            tbody.innerHTML = '';

            const busca = normalizarBuscaAluno(document.getElementById('busca-alunos')?.value);
            const alunosFiltrados = alunos.filter(aluno =>
                normalizarBuscaAluno(`${aluno.nome || ''} ${aluno.matricula || ''}`).includes(busca)
            );

            alunosFiltrados.forEach(a => {
                tbody.innerHTML += `
                    <tr>
                        <td>
                            <img src="${a.foto}" alt="Foto" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary-color, #f39c12);">
                        </td>
                        <td><b>${a.matricula}</b></td>
                        <td><b>${a.nome}</b></td>
                        <td>${a.doc || '—'}</td>
                        <td>${a.tel || '—'}</td>
                        <td>${a.end || '—'}</td>
                        <td><span class="badge" style="background: rgba(243, 156, 18, 0.15); color: var(--primary-color, #f39c12); padding: 3px 8px; border-radius: 4px;">${a.plano || 'Não informado'}</span></td>
                        <td>
                            ${a.atestadoSim ? `<span style="color: #2ecc71;">✅ Apresentado</span><br><small>Val: ${a.atestadoVal || 'N/A'}</small>` : `<span style="color: #e74c3c;">❌ Pendente</span>`}
                        </td>
                        <td class="actions-cell">
                            <button class="btn btn-edit" onclick="editarAluno(${a.id})">Editar</button>
                            <button class="btn btn-danger" onclick="deletarAluno(${a.id})">Excluir</button>
                        </td>
                    </tr>
                `;
            });
            if (!alunosFiltrados.length) {
                tbody.innerHTML = '<tr><td colspan="9">Nenhum aluno encontrado.</td></tr>';
            }
            atualizarPreviewMatricula(alunos);
            renderSituacaoFinanceira();
        }

        function formatDateBR(dateISO) {
            if (!dateISO) return '—';
            const [year, month, day] = dateISO.split('-');
            return `${day}/${month}/${year}`;
        }

        function formatarMoedaBRL(valor) {
            const quantia = Number(valor);
            return Number.isFinite(quantia) && quantia >= 0
                ? quantia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '—';
        }

        function getAlunoDiaVencimento(aluno) {
            if (Number.isInteger(Number(aluno.diaVencimento)) && Number(aluno.diaVencimento) >= 1 && Number(aluno.diaVencimento) <= 31) {
                return Number(aluno.diaVencimento);
            }

            // Mantém compatibilidade com alunos cadastrados anteriormente usando data completa.
            if (typeof aluno.vencimento === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(aluno.vencimento)) {
                return Number(aluno.vencimento.split('-')[2]);
            }
            return null;
        }

        function createFinanceCell(row, value) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.append(cell);
            return cell;
        }

        function renderSituacaoFinanceira() {
            const tbody = document.getElementById('tabela-financeiro-body');
            if (!tbody) return;
            const alunos = getDB('alunos');
            const hoje = new Date();
            const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
            const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
            tbody.replaceChildren();

            const busca = normalizarBuscaAluno(document.getElementById('busca-financeira')?.value);
            const alunosFiltrados = alunos.filter(aluno =>
                normalizarBuscaAluno(`${aluno.nome || ''} ${aluno.matricula || ''}`).includes(busca)
            );

            alunosFiltrados.forEach(aluno => {
                const diaVencimento = getAlunoDiaVencimento(aluno);
                const historicoBaixas = obterHistoricoBaixas(aluno);
                const ultimaBaixa = historicoBaixas[historicoBaixas.length - 1];
                const row = document.createElement('tr');
                createFinanceCell(row, aluno.matricula || '—');
                createFinanceCell(row, aluno.nome || 'Aluno sem nome');
                createFinanceCell(row, diaVencimento ? `Dia ${diaVencimento}` : '—');

                const statusCell = document.createElement('td');
                const baixaNoMesAtual = typeof ultimaBaixa?.data === 'string'
                    && ultimaBaixa.data.slice(0, 7) === mesAtual;
                const status = !diaVencimento
                    ? 'Cadastrar vencimento'
                    : hoje.getDate() > Math.min(diaVencimento, ultimoDiaDoMes) && !baixaNoMesAtual ? 'Atrasado' : 'Em dia';
                const statusBadge = document.createElement('span');
                statusBadge.className = `badge ${status === 'Em dia' ? 'badge-success' : 'badge-danger'}`;
                statusBadge.textContent = status;
                statusCell.append(statusBadge);
                row.append(statusCell);

                createFinanceCell(row, formatDateBR(ultimaBaixa?.data));
                createFinanceCell(row, status === 'Atrasado' ? formatarMoedaBRL(aluno.valorMensalidade) : formatarMoedaBRL(0));
                const actionCell = document.createElement('td');
                actionCell.className = 'finance-actions';

                if (diaVencimento) {
                    const paymentButton = document.createElement('button');
                    paymentButton.type = 'button';
                    paymentButton.className = 'btn btn-success finance-action';
                    paymentButton.textContent = 'Dar baixa';
                    paymentButton.setAttribute('aria-label', `Dar baixa no pagamento de ${aluno.nome}`);
                    paymentButton.addEventListener('click', () => darBaixaPagamento(aluno.id));
                    actionCell.append(paymentButton);
                } else {
                    const dueDayInput = document.createElement('input');
                    dueDayInput.type = 'number';
                    dueDayInput.min = '1';
                    dueDayInput.max = '31';
                    dueDayInput.step = '1';
                    dueDayInput.placeholder = 'Dia (1–31)';
                    dueDayInput.setAttribute('aria-label', `Dia de vencimento de ${aluno.nome}`);
                    const saveDueDayButton = document.createElement('button');
                    saveDueDayButton.type = 'button';
                    saveDueDayButton.className = 'btn btn-success finance-action';
                    saveDueDayButton.textContent = 'Salvar dia';
                    saveDueDayButton.addEventListener('click', () => salvarVencimentoAluno(aluno.id, dueDayInput.value));
                    actionCell.append(dueDayInput, saveDueDayButton);
                }

                if (ultimaBaixa) {
                    const undoButton = document.createElement('button');
                    undoButton.type = 'button';
                    undoButton.className = 'btn btn-danger finance-action';
                    undoButton.textContent = 'Desfazer baixa';
                    undoButton.setAttribute('aria-label', `Desfazer a última baixa de ${aluno.nome}`);
                    undoButton.addEventListener('click', () => desfazerUltimaBaixa(aluno.id));
                    actionCell.append(undoButton);

                    const valorComprovante = parseValorMonetario(ultimaBaixa.valor ?? aluno.valorMensalidade);
                    if (valorComprovante !== null) {
                        const receiptButton = document.createElement('button');
                        receiptButton.type = 'button';
                        receiptButton.className = 'btn btn-secondary finance-action';
                        receiptButton.textContent = 'Abrir comprovante';
                        receiptButton.setAttribute('aria-label', `Abrir comprovante da última baixa de ${aluno.nome}`);
                        receiptButton.addEventListener('click', () => abrirComprovantePagamento(
                            aluno,
                            ultimaBaixa.data,
                            valorComprovante
                        ));
                        actionCell.append(receiptButton);
                    }
                }

                row.append(actionCell);
                tbody.append(row);
            });

            if (!alunosFiltrados.length) {
                const row = document.createElement('tr');
                const cell = createFinanceCell(row, 'Nenhum aluno encontrado.');
                cell.colSpan = 7;
                tbody.append(row);
            }
        }

        document.getElementById('busca-alunos')?.addEventListener('input', renderAlunos);
        document.getElementById('busca-financeira')?.addEventListener('input', renderSituacaoFinanceira);

        function salvarVencimentoAluno(alunoId, vencimento) {
            const diaVencimento = Number(vencimento);
            if (!Number.isInteger(diaVencimento) || diaVencimento < 1 || diaVencimento > 31) {
                alert('Informe um dia de vencimento entre 1 e 31.');
                return;
            }

            const alunos = getDB('alunos');
            const aluno = alunos.find(item => item.id === alunoId);
            if (!aluno) return;

            aluno.diaVencimento = diaVencimento;
            delete aluno.vencimento;
            saveDB('alunos', alunos);
            renderSituacaoFinanceira();
        }

        function darBaixaPagamento(alunoId) {
            const alunos = getDB('alunos');
            const aluno = alunos.find(item => item.id === alunoId);
            if (!aluno || !getAlunoDiaVencimento(aluno)) return;

            if (!confirm(`Confirmar o pagamento mensal de ${aluno.nome}?`)) {
                return;
            }

            const valorPadrao = aluno.valorMensalidade !== null
                && aluno.valorMensalidade !== undefined
                && Number.isFinite(Number(aluno.valorMensalidade))
                ? Number(aluno.valorMensalidade).toFixed(2).replace('.', ',')
                : '';
            const valorDigitado = prompt('Informe o valor recebido para gerar o comprovante:', valorPadrao);
            if (valorDigitado === null) {
                return;
            }
            const valorRecebido = parseValorMonetario(valorDigitado);
            if (valorRecebido === null) {
                alert('Informe um valor válido, por exemplo: 100,00.');
                return;
            }

            const janelaComprovante = window.open('', '_blank', 'width=450,height=700');
            const hoje = new Date();
            const dataBaixa = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
            const historicoBaixas = obterHistoricoBaixas(aluno);
            historicoBaixas.push({ data: dataBaixa, valor: valorRecebido });
            aluno.historicoBaixas = historicoBaixas;
            aluno.ultimaBaixa = dataBaixa;
            aluno.valorMensalidade = valorRecebido;
            aluno.diaVencimento = getAlunoDiaVencimento(aluno);
            delete aluno.vencimento;
            saveDB('alunos', alunos);
            renderSituacaoFinanceira();

            if (janelaComprovante) {
                try {
                    gerarComprovantePagamento(janelaComprovante, aluno, dataBaixa, valorRecebido);
                } catch (error) {
                    console.error('Falha ao gerar o comprovante de pagamento:', error);
                    janelaComprovante.close();
                    alert('A baixa foi registrada, mas não foi possível gerar o comprovante. Tente novamente pelo botão "Abrir comprovante".');
                }
            } else {
                alert('A baixa foi registrada, mas o navegador bloqueou o comprovante. Permita pop-ups ou use o botão "Abrir comprovante".');
            }
        }

        function parseValorMonetario(valor) {
            let normalizado = String(valor).trim().replace(/\s/g, '');
            if (!normalizado) return null;
            if (normalizado.includes(',')) {
                normalizado = normalizado.replace(/\./g, '').replace(',', '.');
            }
            const numero = Number(normalizado);
            return Number.isFinite(numero) && numero >= 0 ? numero : null;
        }

        function escaparHtml(valor) {
            return String(valor).replace(/[&<>"']/g, caractere => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[caractere]);
        }

        function abrirComprovantePagamento(aluno, dataISO, valor) {
            const janelaComprovante = window.open('', '_blank', 'width=450,height=700');
            if (!janelaComprovante) {
                alert('Permita pop-ups para este arquivo para abrir o comprovante.');
                return;
            }

            try {
                gerarComprovantePagamento(janelaComprovante, aluno, dataISO, valor);
            } catch (error) {
                console.error('Falha ao gerar o comprovante de pagamento:', error);
                janelaComprovante.close();
                alert('Não foi possível gerar o comprovante. Tente novamente pelo navegador.');
            }
        }

        function gerarComprovantePagamento(janela, aluno, dataISO, valor) {
            const largura = document.getElementById('largura-comprovante')?.value === '58' ? 58 : 80;
            const agora = new Date();
            const dataFormatada = formatDateBR(dataISO);
            const horaFormatada = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
            const numeroComprovante = `${aluno.matricula || aluno.id}-${dataISO.replace(/-/g, '')}-${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}${String(agora.getSeconds()).padStart(2, '0')}`;

            janela.document.open();
            janela.document.write(`<!doctype html>
                <html lang="pt-BR">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Comprovante ${escaparHtml(numeroComprovante)}</title>
                    <style>
                        @page { size: ${largura}mm auto; margin: 0; }
                        * { box-sizing: border-box; }
                        html, body { width: ${largura}mm; margin: 0; }
                        body { padding: 4mm; color: #111; font: 11px/1.45 Arial, sans-serif; }
                        main { width: 100%; }
                        h1 { margin: 0 0 3mm; text-align: center; font-size: 15px; }
                        p { margin: 1.5mm 0; overflow-wrap: anywhere; }
                        .center { text-align: center; }
                        .divider { border: 0; border-top: 1px dashed #111; margin: 3mm 0; }
                        .total { display: flex; justify-content: space-between; gap: 3mm; font-size: 13px; font-weight: bold; }
                        .footer { margin-top: 5mm; text-align: center; font-size: 10px; }
                        @media screen { body { margin: 8px auto; box-shadow: 0 0 8px #aaa; } }
                    </style>
                </head>
                <body>
                    <main>
                        <h1>ACADEMIA THOR</h1>
                        <p class="center"><strong>COMPROVANTE DE PAGAMENTO</strong></p>
                        <hr class="divider">
                        <p><strong>Comprovante:</strong> ${escaparHtml(numeroComprovante)}</p>
                        <p><strong>Aluno:</strong> ${escaparHtml(aluno.nome || 'Aluno')}</p>
                        <p><strong>Matrícula:</strong> ${escaparHtml(aluno.matricula || '—')}</p>
                        <p><strong>Referência:</strong> ${escaparHtml(dataFormatada)}</p>
                        <p><strong>Horário:</strong> ${escaparHtml(horaFormatada)}</p>
                        <p><strong>Descrição:</strong> Mensalidade</p>
                        <hr class="divider">
                        <p class="total"><span>VALOR PAGO</span><span>${escaparHtml(formatarMoedaBRL(valor))}</span></p>
                        <hr class="divider">
                        <p class="footer">Pagamento recebido. Obrigado!</p>
                    </main>
                    <script>window.addEventListener('load', () => { window.focus(); window.print(); });</script>
                </body>
                </html>`);
            janela.document.close();
        }

        function obterHistoricoBaixas(aluno) {
            const historico = Array.isArray(aluno.historicoBaixas)
                ? aluno.historicoBaixas.map(baixa => typeof baixa === 'string'
                    ? (/^\d{4}-\d{2}-\d{2}$/.test(baixa) ? { data: baixa } : null)
                    : baixa && typeof baixa.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(baixa.data)
                        ? { data: baixa.data, valor: baixa.valor }
                        : null).filter(Boolean)
                : [];
            if (aluno.ultimaBaixa && historico[historico.length - 1]?.data !== aluno.ultimaBaixa) {
                historico.push({ data: aluno.ultimaBaixa });
            }
            return historico;
        }

        function desfazerUltimaBaixa(alunoId) {
            const alunos = getDB('alunos');
            const aluno = alunos.find(item => item.id === alunoId);
            const historicoBaixas = aluno ? obterHistoricoBaixas(aluno) : [];
            const ultimaBaixa = historicoBaixas[historicoBaixas.length - 1];
            if (!aluno || !ultimaBaixa) return;

            const dataEstornada = ultimaBaixa.data;
            if (!confirm(`Desfazer a baixa de ${formatDateBR(dataEstornada)} para ${aluno.nome}? A situação financeira será recalculada.`)) {
                return;
            }

            historicoBaixas.pop();
            aluno.historicoBaixas = historicoBaixas;
            aluno.ultimaBaixa = historicoBaixas[historicoBaixas.length - 1]?.data || '';
            saveDB('alunos', alunos);
            renderSituacaoFinanceira();
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
                const nome = document.getElementById('plano-nome').value.trim();
                const valor = Number(document.getElementById('plano-valor').value);
                if (!nome || !Number.isFinite(valor) || valor < 0) {
                    alert('Informe um nome e um valor válido para o plano.');
                    return;
                }

                try {
                    const planos = getDB('planos');
                    if (!Array.isArray(planos)) throw new Error('Os dados salvos de planos não estão no formato esperado.');
                    planos.push({
                        id: Date.now(),
                        nome,
                        valor,
                        desc: document.getElementById('plano-desc').value.trim()
                    });
                    saveDB('planos', planos);
                } catch (error) {
                    console.error('Falha ao salvar o plano:', error);
                    alert('Não foi possível salvar o plano neste navegador. Verifique o armazenamento e tente novamente.');
                    return;
                }

                e.target.reset();
                renderPlanos();
                alert('Plano cadastrado com sucesso!');
            });
        }

        function renderPlanos() {
            const planos = getDB('planos');
            const container = document.getElementById('lista-planos');
            if (!container) return;
            container.replaceChildren();
            if (!Array.isArray(planos) || planos.length === 0) {
                const mensagem = document.createElement('p');
                mensagem.className = 'empty-list-message';
                mensagem.textContent = 'Nenhum plano cadastrado ainda.';
                container.append(mensagem);
                return;
            }

            planos.forEach(plano => {
                const card = document.createElement('article');
                card.className = 'plan-card';
                const detalhes = document.createElement('div');
                const nome = document.createElement('strong');
                const valor = document.createElement('span');
                const descricao = document.createElement('small');
                const remover = document.createElement('button');

                nome.textContent = plano.nome || 'Plano sem nome';
                valor.textContent = Number.isFinite(Number(plano.valor))
                    ? Number(plano.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'Valor não informado';
                descricao.textContent = plano.desc || 'Sem descrição';
                remover.type = 'button';
                remover.className = 'btn btn-danger plan-remove-button';
                remover.textContent = 'Remover';
                remover.addEventListener('click', () => removerItem('planos', plano.id, renderPlanos));

                detalhes.append(nome, valor, descricao);
                card.append(detalhes, remover);
                container.append(card);
            });
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
        const professorSpecialties = [];
        const specialtyInput = document.getElementById('prof-esp');
        const specialtyList = document.getElementById('prof-especialidades-lista');

        function normalizeSpecialties(specialties) {
            const values = Array.isArray(specialties) ? specialties : String(specialties || '').split(',');
            return values.map(specialty => String(specialty).trim()).filter(Boolean);
        }

        function renderProfessorSpecialties() {
            if (!specialtyList) return;
            specialtyList.replaceChildren();

            professorSpecialties.forEach((specialty, index) => {
                const chip = document.createElement('span');
                chip.className = 'specialty-chip';

                const name = document.createElement('span');
                name.textContent = specialty;

                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.className = 'specialty-remove';
                removeButton.setAttribute('aria-label', `Remover especialidade ${specialty}`);
                removeButton.textContent = '×';
                removeButton.addEventListener('click', () => {
                    professorSpecialties.splice(index, 1);
                    renderProfessorSpecialties();
                });

                chip.append(name, removeButton);
                specialtyList.append(chip);
            });
        }

        function addProfessorSpecialty() {
            if (!specialtyInput) return;
            const specialties = normalizeSpecialties(specialtyInput.value);
            if (!specialties.length) {
                specialtyInput.focus();
                return;
            }

            specialties.forEach(specialty => {
                if (!professorSpecialties.some(item => item.toLocaleLowerCase() === specialty.toLocaleLowerCase())) {
                    professorSpecialties.push(specialty);
                }
            });
            specialtyInput.value = '';
            renderProfessorSpecialties();
            specialtyInput.focus();
        }

        if (specialtyInput) {
            specialtyInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    addProfessorSpecialty();
                }
            });
        }

        if (formProf) {
            formProf.addEventListener('submit', (e) => {
                e.preventDefault();
                if (specialtyInput && specialtyInput.value.trim()) addProfessorSpecialty();

                const profs = getDB('profs');
                profs.push({
                    id: Date.now(),
                    nome: document.getElementById('prof-nome').value,
                    crf: document.getElementById('prof-crf').value,
                    esp: professorSpecialties.join(', '),
                    desc: document.getElementById('prof-desc').value,
                    lancado: false
                });
                saveDB('profs', profs);
                e.target.reset();
                professorSpecialties.length = 0;
                renderProfessorSpecialties();
                renderProfs();
            });
        }

        function renderProfs() {
            const profs = getDB('profs');
            const container = document.getElementById('lista-professores');
            if (!container) return;
            container.innerHTML = profs.map(p => `
                <div style="background:#f8fafc; padding:1rem; margin-bottom:0.5rem; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div><b>${p.nome}</b> (CRF: ${p.crf}) - ${normalizeSpecialties(p.esp).join(', ')} <span class="badge ${p.lancado ? 'badge-success' : 'badge-danger'}">${p.lancado ? 'No Ar' : 'Rascunho'}</span></div>
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
  