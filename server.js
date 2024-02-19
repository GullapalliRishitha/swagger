const express = require('express');
const app = express();
const port = 3000;

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'sample',
  port:3306,
  connLimit: 5
});

app.use(express.json());
app.use(cors());

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Personal Budget API',
      version: '1.0.0',
      description: 'API for managing food items in a budget',
    },
  },
  apis: ['./server.js'],
};
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

async function executeQuery(query) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(query);
    return rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) return conn.end();
  }
}

function validateFoodRequest(req, res, next) {
  const { name, unit, companyId } = req.body;
  // Validation logic
  if (!name || typeof name !== 'string' || !unit || typeof unit !== 'string' || !companyId || typeof companyId !== 'string') {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  // Transformation logic (if needed)
  req.body = { name: name.trim(), unit: unit.trim(), companyId: companyId.trim() };
  next();
}

/**
 * @swagger
 * /foods:
 *   post:
 *     summary: Create a new food item
 *     description: Add a new food item to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               companyId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Food item created successfully.
 *       400:
 *         description: Invalid request body.
 *       500:
 *         description: Internal server error.
 */
app.post('/foods', validateFoodRequest, async (req, res) => {
  const newFood = req.body;
  try {
    const result = await executeQuery(`INSERT INTO foods (ITEM_NAME, ITEM_UNIT, COMPANY_ID) VALUES ('${newFood.name}', '${newFood.unit}', '${newFood.companyId}')`);
    res.status(201).json(newFood);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /foods/{id}:
 *   put:
 *     summary: Update a food item
 *     description: Update an existing food item in the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the food item to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               companyId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Food item updated successfully.
 *       400:
 *         description: Invalid request body.
 *       404:
 *         description: Food item not found.
 *       500:
 *         description: Internal server error.
 */
app.put('/foods/:id', validateFoodRequest, async (req, res) => {
  const itemId = req.params.id;
  const { name, unit, companyId } = req.body;

  try {
    const result = await executeQuery(`UPDATE foods SET ITEM_NAME = '${name}', ITEM_UNIT = '${unit}', COMPANY_ID = '${companyId}' WHERE ITEM_ID = '${itemId}'`);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Food updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /foods/{id}:
 *   patch:
 *     summary: Update a food item partially
 *     description: Update some properties of an existing food item in the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the food item to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               companyId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Food item updated successfully.
 *       400:
 *         description: Invalid request body.
 *       404:
 *         description: Food item not found.
 *       500:
 *         description: Internal server error.
 */
app.patch('/foods/:id', validateFoodRequest, async (req, res) => {
  const itemId = req.params.id;
  const { name, unit, companyId } = req.body;
try {
    const result = await executeQuery(`UPDATE foods SET ITEM_NAME = '${name}', ITEM_UNIT = '${unit}', COMPANY_ID = '${companyId}' WHERE ITEM_ID = '${itemId}'`);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Food updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /foods/{id}:
 *   delete:
 *     summary: Delete a food item
 *     description: Delete an existing food item from the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the food item to delete.
 *     responses:
 *       204:
 *         description: Food item deleted successfully.
 *       404:
 *         description: Food item not found.
 *       500:
 *         description: Internal server error.
 */
app.delete('/foods/:id', async (req, res) => {
  const itemId = req.params.id;

  try {
    const result = await executeQuery(`DELETE FROM foods WHERE ITEM_ID = '${itemId}'`);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
