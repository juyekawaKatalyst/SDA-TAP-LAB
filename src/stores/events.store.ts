import { writable, type Writable } from 'svelte/store';
import { HYPT } from '@/classes/standards/HYP/HYP';
import { HYPCOLLECTIONT } from '@/classes/standards/HYP/HYPCOLLECTION';
import type { SITT } from '@/classes/standards/LDM/SIT';
import hyptTest from '@/testdata/hpyt.test';

// Create a simple writable store with the test data
export const messages = writable<any[]>(hyptTest);

// Helper function to get the message type
export const getMessageType = (message: any) => {
    // Extract the type based on the key ending with "COLLECTION"
    const messageTypeEntry = Object.entries(message).find(([key, _]) =>
        key.endsWith("COLLECTION")
    );
    return messageTypeEntry ? messageTypeEntry[0].split("COLLECTION")[0] : "ANY";
};

// Keep these exported stores for compatibility with existing code
export const activeEvents: Writable<any> = writable({});
export const activeEvent: Writable<HYPT | SITT | any> = writable(new HYPT());