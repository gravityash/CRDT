import { Router } from 'express';
import { memoryDb } from '../store/memoryDb';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get Workspaces
router.get('/', (req, res) => {
  const workspaces = Array.from(memoryDb.workspaces.values());
  res.json(workspaces);
});

// Get Documents
router.get('/documents', (req, res) => {
  const docs = Array.from(memoryDb.documents.values());
  res.json(docs);
});

// Get Single Document
router.get('/documents/:id', (req, res) => {
  const doc = memoryDb.documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json(doc);
});

// Create Document
router.post('/documents', (req, res) => {
  const { title, workspaceId, content, engine } = req.body;
  const newDoc = {
    id: `doc_${Date.now()}`,
    title: title || 'Untitled Document',
    workspaceId: workspaceId || 'ws_default_1',
    content: content || '# New Document\nStart typing here...',
    engine: engine || 'crdt',
    version: 1,
    updatedAt: new Date().toISOString()
  };
  memoryDb.documents.set(newDoc.id, newDoc);
  res.status(201).json(newDoc);
});

// Update Document Engine / Content
router.put('/documents/:id', (req, res) => {
  const doc = memoryDb.documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  
  if (req.body.title !== undefined) doc.title = req.body.title;
  if (req.body.content !== undefined) doc.content = req.body.content;
  if (req.body.engine !== undefined) doc.engine = req.body.engine;
  doc.version += 1;
  doc.updatedAt = new Date().toISOString();

  res.json(doc);
});

// Get Whiteboards
router.get('/whiteboards', (req, res) => {
  const boards = Array.from(memoryDb.whiteboards.values());
  res.json(boards);
});

// Get Single Whiteboard
router.get('/whiteboards/:id', (req, res) => {
  const board = memoryDb.whiteboards.get(req.params.id);
  if (!board) return res.status(404).json({ error: 'Whiteboard not found' });
  res.json(board);
});

// Create Whiteboard
router.post('/whiteboards', (req, res) => {
  const { title, workspaceId, engine } = req.body;
  const newBoard = {
    id: `board_${Date.now()}`,
    title: title || 'Untitled Whiteboard',
    workspaceId: workspaceId || 'ws_default_1',
    elements: [],
    engine: engine || 'crdt',
    version: 1,
    updatedAt: new Date().toISOString()
  };
  memoryDb.whiteboards.set(newBoard.id, newBoard);
  res.status(201).json(newBoard);
});

// Comments
router.get('/comments/:targetId', (req, res) => {
  const comments = memoryDb.comments.filter(c => c.targetId === req.params.targetId);
  res.json(comments);
});

router.post('/comments', (req, res) => {
  const { targetId, userId, userName, userAvatar, text } = req.body;
  const newComment = {
    id: uuidv4(),
    targetId,
    userId: userId || 'usr_demo_1',
    userName: userName || 'Alex Rivera',
    userAvatar: userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    text,
    createdAt: new Date().toISOString(),
    resolved: false
  };
  memoryDb.comments.push(newComment);
  res.status(201).json(newComment);
});

export default router;
