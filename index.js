const express = require('express');
const http = require('http');
const puppeteer = require('puppeteer');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

async function scrapingReclameAqui(url) {
    const browser = await puppeteer.launch({
     headless: false,
    isDebuggerActived: false,
 });
    const page = await browser.newPage();
    
    // Definir um tempo limite de navegação de 60 segundos
    await page.setDefaultNavigationTimeout(60000);

    console.log('Acessando URL:', url);
    await page.goto(url);

    const imgSrc = await page.evaluate(() => {
        const logoWrapperElement = document.querySelector('.logo-wrapper');
        const imgElement = logoWrapperElement ? logoWrapperElement.querySelector('img') : null;
        return imgElement ? imgElement.getAttribute('src') : null;
    });

    const nomeEmpresa = await page.evaluate(() => {
        const shortNameElement = document.querySelector('.short-name');
        return shortNameElement ? shortNameElement.textContent.trim() : null;
    });

    const avaliacao = await page.evaluate(() => {
        const element = document.querySelector('.short-name').nextElementSibling;
        return element ? element.textContent.trim() : null;
    });

    const notaMedia = await page.evaluate(() => {
        let element = document.querySelector('.go3621686408');
        if (!element.textContent.trim()) {
            element = document.querySelector('.go2217866072');
        }
        return element ? element.textContent.trim() : null;
    });

    await browser.close();

    return {
        imgSrc: imgSrc,
        nomeEmpresa: nomeEmpresa,      
        avaliacao: avaliacao,
        notaMedia: notaMedia
    };
}

// Rota para lidar com a solicitação GET e retornar os dados como JSON
app.get('/reclameaqui', async (req, res) => {
    try {
        // Verificar se foi fornecida uma URL na query
        const url = req.query.url;
        if (!url) {
            throw new Error('URL não fornecida na query');
        }

        console.log('Iniciando scraping do ReclameAqui para a URL:', url);
        const data = await scrapingReclameAqui(url);
        console.log('Dados obtidos com sucesso:', data);
        res.json(data); // Retornar os dados como JSON
    } catch (error) {
        console.error('Erro ao obter dados do ReclameAqui:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Servidor ouvindo na porta ${PORT}`);
});
