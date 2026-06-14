const roleMiddleware = {

  isProjectManager: (req, res, next) => {
    const userRole = req.headers['user-role'];
    
    if (!userRole) {
      return res.status(401).json({ error: 'Unauthorized - No role provided' });
    }

    if (userRole !== 'Project Manager' && userRole !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden - Only Project Managers can perform this action' });
    }

    next();
  },

  isCollaboratorOrAbove: (req, res, next) => {
    const userRole = req.headers['user-role'];

    if (!userRole) {
      return res.status(401).json({ error: 'Unauthorized - No role provided' });
    }

    const allowedRoles = ['Admin', 'Project Manager', 'Collaborator'];
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden - Access denied' });
    }

    next();
  }

};

module.exports = roleMiddleware;