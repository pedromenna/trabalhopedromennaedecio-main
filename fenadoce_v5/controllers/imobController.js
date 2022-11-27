import dbKnex from '../dados/db_config.js'

export const imoveisIndex = async (req, res) => {
  try {

    const casas = await dbKnex.select("*").from("casas")
    res.status(200).json(casas)
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const imoveisstore = async (req, res) => {
  console.log(req.file.originalname);
  console.log(req.file.filename);
  console.log(req.file.mimetype);
  console.log(req.file.size);

  const foto = req.file.path;

  if ((req.file.mimetype != "image/jpeg" && req.file.mimetype != "image/png") || req.file.size > 1024 * 1024) {
    fs.unlinkSync(foto); 
    res
      .status(400)
      .json({ msg: "Formato inválido da imagem ou imagem muito grande" });
    return;
  }


  const { tipo, data, endereco, admins_id } = req.body


  if (!tipo || !data || !endereco|| !foto || !admins_id) {
    res.status(400).json({ id: 0, msg: "Erro... informe tipo, data, endereco, admins_id e foto do imóvel" })
    return
  }

  try {
    const novo = await dbKnex('casas').insert({ tipo, data, endereco, foto, admins_id })
                  
    res.status(201).json({ id: novo[0], msg: "Ok! Inserido com sucesso" })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const imoveisupdate = async (req, res) => {
  const { id } = req.params;

  const { tipo, data, endereco } = req.body

  if (!tipo || !data || !endereco) {
    res.status(400).json(
      {
        id: 0,
        msg: "Erro... informe tipo, data e endereço do imóvel"
      })
    return
  }

  try {
    await dbKnex("casas").where({ id })
      .update({ tipo, data, endereco })

    res.status(200).json({ id, msg: "Ok! Alterado com sucesso" })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }

}

export const imoveisdelete = async (req, res) => {
  const { id } = req.params;

  console.log(req.admin_id)
  console.log(req.admin_nome)

  try {
    await dbKnex("casas").where({ id }).del()
    res.status(200).json({ id, msg: "Ok! Excluído com sucesso" })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}



export const alugueltotal = async (req, res) => {
  try {
    const consulta = await dbKnex("casas")
            .sum({total: "votos"})
            .max({maior: "votos"})
    const {total, maior} = consulta[0]        
    res.status(200).json({total, maior})
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const casaPdf = async(req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto('http://localhost:3001/candidatas/lista');
  
    await page.waitForNetworkIdle(0)
  
    const pdf = await page.pdf({
      printBackground: true,
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
  
    await browser.close();
  

    res.contentType('application/pdf')
  
    res.status(200).send(pdf)
  }