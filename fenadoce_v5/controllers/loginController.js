import dbKnex from '../dados/db_config.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import * as dotenv from 'dotenv' 
dotenv.config()

export const loginAdmin = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ erro: "Login ou senha incorretos" });
    return;
  }


  try {
    const dados = await dbKnex("admins").where({ email });
    if (dados.length == 0) {

      res.status(400).json({ erro: "Login ou senha incorretos" });
      return;
    }


    if (bcrypt.compareSync(senha, dados[0].senha)) {      
      const token = jwt.sign({
        admin_id: dados[0].id,
        admin_nome: dados[0].nome,
      }, process.env.JWT_KEY,
      {
        expiresIn: "1h"
      }
      )

      res.status(200).json({ msg: "Ok! Acesso Liberado", token });
    } else {

      res.status(400).json({ erro: "Login ou senha incorretos" });
    }
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}