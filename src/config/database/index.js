import mongoose from 'mongoose';

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/tien_basic');
        console.log('Connect DB Successfully!')

    } catch (error) {
        console.log('Connect DB Failed!')
    }
}

export default {connect};