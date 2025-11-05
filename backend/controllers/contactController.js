import Contact from '../models/Contact.js';

// Create a new contact message
export const createContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please provide name, email, and message' });
    }

    const contact = await Contact.create({
      name,
      email,
      message,
    });

    res.status(201).json({
      _id: contact._id,
      name: contact.name,
      email: contact.email,
      message: contact.message,
      createdAt: contact.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all contact messages (for admin - would need authentication)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

