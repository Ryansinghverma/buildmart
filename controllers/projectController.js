const Project = require('../models/Project')
const Order = require('../models/Order')

// GET /api/projects/:userId
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ contractorId: req.params.userId }).sort({
      createdAt: -1,
    })

    // Attach order summaries to each project
    const projectsWithOrders = await Promise.all(
      projects.map(async (p) => {
        const orders = await Order.find({ projectId: p._id }).select(
          'status totalAmount createdAt'
        )
        return { ...p.toObject(), orders }
      })
    )

    res.json(projectsWithOrders)
  } catch (error) {
    next(error)
  }
}

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, location } = req.body
    const project = await Project.create({
      contractorId: req.user._id,
      name,
      location,
    })
    res.status(201).json(project)
  } catch (error) {
    next(error)
  }
}

// PUT /api/projects/:projectId/orders  — assign an order to a project
const assignOrderToProject = async (req, res, next) => {
  try {
    const { orderId } = req.body

    const project = await Project.findOne({
      _id: req.params.projectId,
      contractorId: req.user._id,
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const order = await Order.findOneAndUpdate(
      { _id: orderId, contractorId: req.user._id },
      { projectId: project._id },
      { new: true }
    )
    if (!order) return res.status(404).json({ message: 'Order not found' })

    res.json({ message: 'Order assigned to project', order })
  } catch (error) {
    next(error)
  }
}

// PUT /api/projects/:id/status
const updateProjectStatus = async (req, res, next) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, contractorId: req.user._id },
      { status: req.body.status },
      { new: true, runValidators: true }
    )
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (error) {
    next(error)
  }
}

module.exports = { getProjects, createProject, assignOrderToProject, updateProjectStatus }
