import { Router } from 'express';
import { reglaNegocioController } from '../controllers/reglaNegocioController';

const router = Router();

router.get('/', reglaNegocioController.getReglas);
router.post('/', reglaNegocioController.createRegla);
router.put('/:id', reglaNegocioController.updateRegla);
router.delete('/:id', reglaNegocioController.deleteRegla);

export default router;
