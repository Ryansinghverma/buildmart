const express = require('express')
const router = express.Router()
const {
  getProjects,
  createProject,
  assignOrderToProject,
  updateProjectStatus,
} = require('../controllers/projectController')
const { protect, authorise } = require('../middlewares/auth')

router.get('/:userId', protect, getProjects)
router.post('/', protect, authorise('contractor'), createProject)
router.put('/:projectId/orders', protect, authorise('contractor'), assignOrderToProject)
router.put('/:id/status', protect, authorise('contractor'), updateProjectStatus)

module.exports = router
