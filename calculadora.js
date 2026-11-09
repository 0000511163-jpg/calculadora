function salvarHistorico(num1, num2, operacao, resultado) {

    let historico = JSON.parse(
        localStorage.getItem("historicoCalculadora") || "[]"
    );

    historico.unshift({
        num1,
        num2,
        operacao,
        resultado,
        data: new Date().toLocaleString("pt-BR")
    });

    localStorage.setItem(
        "historicoCalculadora",
        JSON.stringify(historico.slice(0, 100))
    );
}