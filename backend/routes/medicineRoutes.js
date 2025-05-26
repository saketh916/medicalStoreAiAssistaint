const express = require('express');
const router = express.Router();
const axios = require('axios');
const Fuse = require('fuse.js');
const Medicine = require('../models/medicine');


// Route to add new medicine
router.post('/', async (req, res) => {
  try {
    const { tabletName, quantityInStock, price, dosageFrequency, usageInstructions, foodWarnings } = req.body;

    if (!tabletName || quantityInStock === undefined) {
      return res.status(400).json({ msg: 'Tablet name and quantity are required.' });
    }

    let medicine = await Medicine.findOne({ tabletName });
    if (medicine) {
      return res.status(400).json({ msg: `Medicine '${tabletName}' already exists.` });
    }

    medicine = new Medicine({ tabletName, quantityInStock, price, dosageFrequency, usageInstructions, foodWarnings });
    await medicine.save();
    res.status(201).json({ msg: `'${tabletName}' added.`, medicine });

  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) {
      return res.status(400).json({ msg: `Medicine '${req.body.tabletName}' already exists.` });
    }
    res.status(500).send('Server Error');
  }
});

// Route to check medicine or find alternatives
router.get('/check', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Medicine name query parameter is required' });
  }

  try {
    // Step 1: Check for exact local stock match
    let localMedicine = await Medicine.findOne({
      tabletName: new RegExp(`^${name}$`, 'i'),
      quantityInStock: { $gt: 0 }
    });

    if (localMedicine) {
      return res.json({
        status: 'available_locally',
        message: `'${name}' is available in your inventory.`,
        data: localMedicine
      });
    }

    // Step 2: Fuzzy search for local alternatives
    const allMedicines = await Medicine.find({});
    const fuse = new Fuse(allMedicines, {
      keys: ['tabletName'],
      threshold: 0.3
    });

    const fuzzyResults = fuse.search(name);
    const topFuzzy = fuzzyResults.slice(0, 3).map(r => r.item.tabletName);

    if (topFuzzy.length > 0) {
      return res.json({
        status: 'not_found_but_similar_exist',
        message: `'${name}' not found, but here are some close matches in your stock:`,
        suggestions: topFuzzy
      });
    }

    // Step 3: Query RxNav for RxCUI
    console.log(`'${name}' not in local stock. Querying RxNav for alternatives...`);
    let rxcui;
    try {
      const rxcuiRes = await axios.get(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(name)}`);
      rxcui = rxcuiRes.data.idGroup?.rxnormId?.[0];
    } catch (apiError) {
      console.error("RxNav RxCUI fetch error:", apiError.message);
    }

    if (!rxcui) {
      return res.status(404).json({
        status: 'not_found_locally_no_rxcui',
        message: `No RxCUI found on RxNav for "${name}". Cannot fetch alternatives. '${name}' also not in local stock.`
      });
    }

    console.log(`RxCUI for ${name}: ${rxcui}`);

    // Step 4: Get related alternatives from RxNav
    let rxNavAlternativeNames = [];
    try {
      const altRes = await axios.get(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allrelated.json`);
      const altData = altRes.data;
      altData.allRelatedGroup?.conceptGroup?.forEach(group => {
        group.conceptProperties?.forEach(drug => {
          if (drug.name && drug.name.toLowerCase() !== name.toLowerCase()) {
            rxNavAlternativeNames.push(drug.name);
          }
        });
      });
    } catch (apiError) {
      console.error("RxNav allrelated fetch error:", apiError.message);
    }

    const uniqueRxNavAlternatives = [...new Set(rxNavAlternativeNames)];
    const top3RxNavAlternatives = uniqueRxNavAlternatives.slice(0, 3);

    console.log(`RxNav suggested alternatives (top 3): ${top3RxNavAlternatives.join(', ') || 'None'}`);

    // Step 5: Check local stock for RxNav alternatives
    if (top3RxNavAlternatives.length > 0) {
      for (const altName of top3RxNavAlternatives) {
        console.log(`Checking local stock for RxNav alternative: ${altName}`);
        const alternativeInStock = await Medicine.findOne({
          tabletName: new RegExp(`^${altName}$`, 'i'),
          quantityInStock: { $gt: 0 }
        });

        if (alternativeInStock) {
          return res.json({
            status: 'alternative_available_locally',
            message: `'${name}' is not available, but this RxNav-suggested alternative is in stock:`,
            data: alternativeInStock
          });
        }
      }
    }

    // Step 6: No alternatives found in stock
    return res.json({
      status: 'not_available_locally_and_no_stocked_alternatives',
      message: `'${name}' is not in local stock. RxNav alternatives were checked, but none are currently in our stock.`,
      rxNavSuggestions: top3RxNavAlternatives
    });

  } catch (err) {
    console.error("Overall error in /check route:", err.message);
    if (err.isAxiosError) {
      return res.status(502).json({ error: 'Error communicating with external drug information service.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
