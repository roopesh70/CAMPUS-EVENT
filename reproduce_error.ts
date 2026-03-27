import { db } from './src/lib/firebase';
import { collection, query, where, runTransaction } from 'firebase/firestore';

async function test() {
  try {
    const q = query(collection(db, 'events'), where('venueId', '==', 'test'));
    await runTransaction(db, async (transaction) => {
      console.log('Starting transaction');
      // @ts-ignore
      const snap = await transaction.get(q);
      console.log('Got snap', snap);
    });
  } catch (err: any) {
    console.error('CAUGHT ERROR:', err.message);
  }
}

test();
