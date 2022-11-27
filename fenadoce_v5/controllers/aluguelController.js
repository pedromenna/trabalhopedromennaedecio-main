import dbKnex from '../dados/db_config.js'
import md5 from 'md5'
import nodemailer from "nodemailer"

export const alugaIndex = async (req, res) => {
  try {
    const alugueis = await dbKnex.select("a.*", "c.tipo as casas")
      .from("alugueis as a")
      .innerJoin("casas as c", { "a.casas_id": "c.id" })
    res.status(200).json(alugueis)
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

async function send_email(nome, email, hash) {

  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "c89cb5717f3ba7",
      pass: "54bfd8146169f1"
    }
  });

  const link = "http://localhost:3001/aluguel/confirma/" + hash

  let mensa = `<p>Sr(a): ${nome}</p>`
  mensa += `<p>Confirme o alguel do imóvel clicando no link a seguir:</p>`
  mensa += `<a href=${link}>Confirmação do Aluguel</a>`

  let info = await transport.sendMail({
    from: '"Imobliriária Satolep" <satolepimo@email.com>', 
    to: email, 
    subject: "Confirmação do Alguel", 
    text: `Para confirmar o aluguel do imóvel, copie e cole no browser o endereço ${link}`, 
    html: mensa, 
  });

}

export const alugaStore = async (req, res) => {

  const { nome, email, casas_id } = req.body

  if (!nome || !email || !casas_id) {
    res.status(400).json({ id: 0, msg: "Informe nome, email e casas_id para confirmar o aluguel" })
    return
  }

  try {
    const verifica = await dbKnex("alugueis").where({ email })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
    return
  }

  const hash = md5(email + casas_id + Date.now())

  try {
    const novo = await dbKnex('alugueis').insert({ nome, email, casas_id, hash_conf: hash })

    send_email(nome, email, hash).catch(console.error);
                  
    res.status(201).json({ id: novo[0], msg: "Confirme o seu aluguel em sua conta de e-mail" })
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const votoConfirme = async (req, res) => {


  const { hash } = req.params


  let voto

  try {

    voto = await dbKnex("alugueis").where({ hash_conf: hash })

    if (voto.length == 0) {
      res.status(400).json({ id: 0, msg: "Copie o link corretamente" })
      return
    }
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
    return
  }

  const trx = await dbKnex.transaction()

  try {
    const novo = await trx('alugueis')
      .where({ hash_conf: hash }).update({ confirmado: 1 })

    await trx("casas")
      .where({ id: voto[0].casas_id }).increment({ alugueis: 1 })

    await trx.commit()

    res.status(201).send("Ok! Seu imóvel está garantidos")
  } catch (error) {

    await trx.rollback()

    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}

export const aluguelGeral = async (req, res) => {
  try {

    const consulta = await dbKnex("alugueis").select("casas_id")
      .count({ Alugueis_Registrados: "*" }).groupBy("casas_id")
    res.status(200).json(consulta)
  } catch (error) {
    res.status(400).json({ id: 0, msg: "Erro: " + error.message })
  }
}
