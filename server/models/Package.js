const packageSchema = new mongoose.Schema({
  // ... existing fields
  deliveryType: {
    type: String,
    enum: ['office', 'address'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'in-transit', 'delivered'],
    default: 'registered'
  },
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office'
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });
