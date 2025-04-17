import { Schema, model } from 'mongoose';

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const MenuItem = model('MenuItem', MenuItemSchema);
export default MenuItem;
