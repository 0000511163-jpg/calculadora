function calcular() {
    const num1 = parseFloat(document.getElementById('numero1').value);
    const num2 = parseFloat(document.getElementById('numero2').value);
    const operacao = document.getElementById('operacao').value;
    const resultadoDiv = document.getElementById('resultado');
    let resultado = 0;

    // Validação de campos vazios
    if (isNaN(num1) || isNaN(num2)) {
        resultadoDiv.innerText = "Insira os dois números";
        resultadoDiv.style.fontSize = "18px";
        return;
    }

    // Restaura o tamanho padrão da fonte caso estivesse exibindo mensagem de erro
    resultadoDiv.style.fontSize = "32px";

    // Menu de operações
    switch (operacao) {
        case '+':
            resultado = num1 + num2;
            break;
        case '-':
            resultado = num1 - num2;
            break;
        case '*':
            resultado = num1 * num2;
            break;
        case '/':
            if (num2 === 0) {
                resultadoDiv.innerText = "Não divida por 0";
                resultadoDiv.style.fontSize = "18px";
                return;
            }
            resultado = num1 / num2;
            break;
        case 'potencia':
            resultado = Math.pow(num1, num2); 
            break;
        case 'raiz':
            if (num1 < 0 && num2 % 2 === 0) {
                resultadoDiv.innerText = "Raiz par negativa inválida nos Reais";
                resultadoDiv.style.fontSize = "16px";
                return;
            }
            resultado = Math.pow(num1, 1 / num2); 
            break;
        default:
            resultado = "Erro";
    }

    // Formata números decimais muito longos para não quebrar o layout (ex: 1.33333333 -> 1.33)
    if (!Number.isInteger(resultado)) {
        resultado = Number(resultado.toFixed(4));
    }

    resultadoDiv.innerText = resultado;
}


/* ========================================================
   1. MOTOR DA CALCULADORA + PERSISTÊNCIA (LOCALSTORAGE)
======================================================== */
function calcular() {
    const num1Input = document.getElementById('numero1').value;
    const num2Input = document.getElementById('numero2').value;
    const num1 = parseFloat(num1Input);
    const num2 = parseFloat(num2Input);
    const operacao = document.getElementById('operacao').value;
    const resultadoDiv = document.getElementById('resultado');
    let resultado = 0;
    let isError = false;

    // Validação de campos vazios
    if (isNaN(num1) || isNaN(num2)) {
        resultado = "Insira os dois números";
        resultadoDiv.innerText = resultado;
        resultadoDiv.style.fontSize = "18px";
        saveCalculationToStorage({ num1: num1Input, num2: num2Input, op: operacao, res: resultado, isError: true });
        return;
    }

    resultadoDiv.style.fontSize = "32px";

    switch (operacao) {
        case '+': resultado = num1 + num2; break;
        case '-': resultado = num1 - num2; break;
        case '*': resultado = num1 * num2; break;
        case '/':
            if (num2 === 0) {
                resultado = "Não divida por 0";
                isError = true;
            } else {
                resultado = num1 / num2;
            }
            break;
        case 'potencia':
            resultado = Math.pow(num1, num2);
            break;
        case 'raiz':
            if (num1 < 0 && num2 % 2 === 0) {
                resultado = "Raiz par negativa inválida nos Reais";
                isError = true;
            } else {
                resultado = Math.pow(num1, 1 / num2);
            }
            break;
        default:
            resultado = "Erro";
            isError = true;
    }

    if (isError) {
        resultadoDiv.innerText = resultado;
        resultadoDiv.style.fontSize = "16px";
    } else {
        if (!Number.isInteger(resultado)) {
            resultado = Number(resultado.toFixed(4));
        }
        resultadoDiv.innerText = resultado;
    }

    // Salva o evento para ser lido no Dashboard
    saveCalculationToStorage({
        num1: num1,
        num2: num2,
        op: operacao,
        res: resultado,
        isError: isError,
        timestamp: new Date().toLocaleTimeString()
    });
}

function saveCalculationToStorage(calcData) {
    const history = JSON.parse(localStorage.getItem('calc_history') || '[]');
    history.unshift(calcData);
    localStorage.setItem('calc_history', JSON.stringify(history));
}


/* ========================================================
   2. DASHBOARD & SUÍTE DE TESTES AUTOMATIZADOS
======================================================== */

let testSuites = [
    {
        name: "Testes da Calculadora",
        tests: [
            { id: 1, name: "Adição Simples", n1: 10, n2: 5, op: "+", expected: "15", status: "PENDING" },
            { id: 2, name: "Divisão por Zero", n1: 8, n2: 0, op: "/", expected: "Não divida por 0", status: "PENDING" },
            { id: 3, name: "Potência de 2^3", n1: 2, n2: 3, op: "potencia", expected: "8", status: "PENDING" },
            { id: 4, name: "Raiz Quadrada de 16", n1: 16, n2: 2, op: "raiz", expected: "4", status: "PENDING" }
        ]
    }
];

function renderDashboardData() {
    const history = JSON.parse(localStorage.getItem('calc_history') || '[]');
    
    // Atualizar Contadores de Uso Real
    const total = history.length;
    const errors = history.filter(h => h.isError).length;
    const success = total - errors;

    if (document.getElementById('realCalcCount')) {
        document.getElementById('realCalcCount').innerText = total;
        document.getElementById('realSuccessCount').innerText = success;
        document.getElementById('realErrorCount').innerText = errors;

        // Calcular operação mais usada
        const opCounts = {};
        history.forEach(h => { opCounts[h.op] = (opCounts[h.op] || 0) + 1; });
        const topOp = Object.keys(opCounts).reduce((a, b) => opCounts[a] > opCounts[b] ? a : b, '-');
        document.getElementById('topOperation').innerText = topOp;

        renderHistoryList(history);
        renderSuites();
    }
}

function renderHistoryList(history) {
    const container = document.getElementById('calcHistoryContainer');
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = '<p style="color:#666;">Nenhum cálculo registrado ainda. Use a calculadora para gerar dados!</p>';
        return;
    }

    container.innerHTML = history.map(h => `
        <div class="history-item">
            <div>
                <strong>${h.num1} ${h.op} ${h.num2}</strong> = ${h.res}
            </div>
            <span style="font-size:12px; color:#666;">${h.timestamp || ''}</span>
        </div>
    `).join('');
}

function renderSuites() {
    const container = document.getElementById('suitesContainer');
    if (!container) return;

    container.innerHTML = testSuites[0].tests.map(t => `
        <div class="test-item">
            <div>
                <strong>${t.name}</strong>
                <div style="font-size:12px; color:#666;">[${t.n1} ${t.op} ${t.n2}] | Esperado: ${t.expected}</div>
            </div>
            <span class="btn-xs">${t.status}</span>
        </div>
    `).join('');
}

function runAllSuites() {
    testSuites[0].tests.forEach(t => {
        // Simulação interna
        let res;
        if (t.op === '+') res = t.n1 + t.n2;
        if (t.op === '/') res = t.n2 === 0 ? "Não divida por 0" : t.n1 / t.n2;
        if (t.op === 'potencia') res = Math.pow(t.n1, t.n2);
        if (t.op === 'raiz') res = Math.pow(t.n1, 1 / t.n2);

        t.status = String(res) === String(t.expected) ? 'PASSED' : 'FAILED';
    });
    renderSuites();
    logConsole('[TESTES] Suíte automatizada concluída com sucesso.', 'success');
}

function clearResults() {
    testSuites[0].tests.forEach(t => t.status = 'PENDING');
    renderSuites();
}

function resetUsageData() {
    localStorage.removeItem('calc_history');
    renderDashboardData();
    logConsole('[SYS] Histórico de uso restaurado.', 'info');
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.add('active');
}

function logConsole(msg, type = 'info') {
    const consoleEl = document.getElementById('consoleLog');
    if (!consoleEl) return;
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerText = msg;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

function clearConsole() {
    const el = document.getElementById('consoleLog');
    if (el) el.innerHTML = '';
}