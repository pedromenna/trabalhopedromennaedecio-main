import { Router, json } from 'express'
import cors from 'cors'

import {  imoveisdelete, imoveisIndex, imoveisstore, alugueltotal, imoveisupdate, casaPdf } from './controllers/imobController.js'
import { alugaIndex, alugaStore, aluguelGeral } from './controllers/aluguelController.js'
import { adminIndex, adminStore } from './controllers/admController.js'
import { loginAdmin } from './controllers/loginController.js'
import { clienteIndex, clienteStore } from './controllers/clienteController.js'

import upload from './middlewares/FotoStore.js'

const router = Router()

router.use(json())


router.use(cors())


router.get('/imoveis', imoveisIndex)
      .post('/imoveis', upload.single('foto'), imoveisstore)
      .put('/imoveis/:id', imoveisupdate)
      .delete('/imoveis/:id', imoveisdelete)
      .get('/imoveis/total_votos', alugueltotal)
      .get('/imoveis/pdf', casaPdf)


router.get('/alugueis', alugaIndex)
      .post('/alugueis', alugaStore)
      .get('/alugueis/totais1', aluguelGeral)


router.get('/admin', adminIndex)
      .post('/admin', adminStore)

router.get('/cliente', clienteIndex)
      .post('/cliente', clienteStore)

router.get('/login', loginAdmin)

export default router