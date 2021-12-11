const express = require("express");

const Product = require("../models/product.model");

const redis = require('../configs/redis');

const router = express.Router();
router.get('', (req, res) => {
  redis.get('myproducts', async function (err, products) {
  
    if (err) console.log(err);

    if (products) return res.status(200).send(JSON.parse(products));

    const all_products = await Product.find().lean().exec();

    redis.set('myproducts', JSON.stringify(all_products));

    return res.status(200).send(all_products);
  });
});
router.post('', async (req, res) => {
  const product = await Product.create(req.body);
  const all_products = await Product.find().lean().exec();

  redis.set('myproducts', JSON.stringify(all_products));

  return res.status(201).send(product);
});



router.patch('/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  redis.set(`myproducts.${req.params.id}`, JSON.stringify(product));

  const all_products = await Product.find().lean().exec();
  redis.set('myproducts', JSON.stringify(all_products));

  return res.status(201).send(product);
});
router.delete('/:id', async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  redis.del(`myproducts.${req.params.id}`);

  const all_products = await Product.find().lean().exec();
  redis.set('myproducts', JSON.stringify(all_products));

  return res.status(201).send(product);
});
router.get('/:id', (req, res) => {
  redis.get(`myproducts.${req.params.id}`, async function (err, productt) {
    if (productt) return res.status(200).send(JSON.parse(productt));

    const product = await Product.findById(req.params.id).lean().exec();

    redis.set(`myproducts.${req.params.id}`, JSON.stringify(product));

    return res.status(200).send(product);
  });
});
module.exports = router;
