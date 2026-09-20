import { Router } from 'express';
import { memoryDb } from '../store/memoryDb';

const router = Router();

// Get Operation History & Snapshots for Time-Travel
router.get('/:targetId', (req, res) => {
  const ops = memoryDb.operations.filter(o => o.targetId === req.params.targetId);
  res.json({
    targetId: req.params.targetId,
    totalOperations: ops.length,
    operations: ops
  });
});

export default router;
