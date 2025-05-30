/**
 * Converts a number of bits to a number of bytes.
 *
 * @param numberOfBits The number of bits to convert.
 * @returns The number of bytes that are needed to store the given number of bits.
 */
function bitsToBytes(numberOfBits: number): number {
    return (numberOfBits >> 3) + Number(numberOfBits % 8 !== 0);
}

interface BitFieldOptions {
    /**
     * If you `set` an index that is out-of-bounds, the bitfield
     * will automatically grow so that the bitfield is big enough
     * to contain the given index, up to the given size (in bit).
     *
     * If you want the Bitfield to grow indefinitely, pass `Infinity`.
     *
     * @default 0.
     */
    grow?: number;
}

export default class BitField {
    /**
     * Grow the bitfield up to this number of entries.
     * @default 0.
     */
    private readonly grow: number;

    /** The internal storage of the bitfield. */
    public buffer: Uint8Array;

    /** The number of bits in the bitfield. */
    get length(): number {
        return this.buffer.length << 3;
    }

    /** Variable to store the count of bits set to 1 */
    private setBitCount: number = 0;

    /** Set to keep track of indices of set bits */
    private readonly setBits: Set<number> = new Set();

    /**
     * Constructs a BitField.
     *
     * @param data Either a number representing the maximum number of supported bytes, or a Uint8Array.
     * @param opts Options for the bitfield.
     */
    constructor(data: number | Uint8Array = 0, options?: BitFieldOptions) {
        const grow = options?.grow;
        this.grow = grow
            ? Number.isFinite(grow)
                ? bitsToBytes(grow)
                : grow
            : 0;
        this.buffer =
            typeof data === "number" ? new Uint8Array(bitsToBytes(data)) : data;
        this.initializeSetBits();
    }

    /**
     * Initialize the set bits based on current buffer data.
     */
    private initializeSetBits(): void {
        for (let i = 0; i < this.length; i++) {
            if (this.get(i)) {
                this.setBits.add(i);
                this.setBitCount++;
            }
        }
    }

    /**
     * Get a particular bit.
     *
     * @param bitIndex Bit index to retrieve.
     * @returns A boolean indicating whether the `i`th bit is set.
     */
    get(bitIndex: number): boolean {
        const byteIndex = bitIndex >> 3;
        return (
            byteIndex < this.buffer.length &&
            !!(this.buffer[byteIndex] & (0b1000_0000 >> bitIndex % 8))
        );
    }

    /**
     * Set a particular bit.
     *
     * Will grow the underlying array if the bit is out of bounds and the `grow` option is set.
     *
     * @param bitIndex Bit index to set.
     * @param value Value to set the bit to. Defaults to `true`.
     */
    set(bitIndex: number, value = true): void {
        const byteIndex = bitIndex >> 3;
        const bitWasSet = this.get(bitIndex);

        if (value) {
            if (!bitWasSet) {
                this.setBitCount++;
                this.setBits.add(bitIndex);
            }
            if (byteIndex >= this.buffer.length) {
                const newLength = Math.max(
                    byteIndex + 1,
                    Math.min(2 * this.buffer.length, this.grow),
                );
                if (newLength <= this.grow) {
                    const newBuffer = new Uint8Array(newLength);
                    newBuffer.set(this.buffer);
                    this.buffer = newBuffer;
                }
            }
            this.buffer[byteIndex] |= 0b1000_0000 >> bitIndex % 8;
        } else if (byteIndex < this.buffer.length) {
            if (bitWasSet) {
                this.setBitCount--;
                this.setBits.delete(bitIndex);
            }
            this.buffer[byteIndex] &= ~(0b1000_0000 >> bitIndex % 8);
        }
    }

    /**
     * Get all indices of bits that are set.
     *
     * @returns An array of indices where bits are set.
     */
    getAllSetIndices(): number[] {
        return Array.from(this.setBits);
    }

    /**
     * Sets a value or an array of values.
     *
     * @param array An array of booleans to set.
     * @param offset The bit offset at which the values are to be written.
     */
    setAll(array: ArrayLike<boolean>, offset = 0): void {
        const targetLength = Math.min(
            bitsToBytes(offset + array.length),
            this.grow,
        );

        if (this.buffer.length < targetLength) {
            const newBuffer = new Uint8Array(targetLength);
            newBuffer.set(this.buffer);
            this.buffer = newBuffer;
        }

        let byteIndex = offset >> 3;
        let bitMask = 0b1000_0000 >> offset % 8;
        for (let index = 0; index < array.length; index++) {
            const bitIndex = offset + index;
            const bitWasSet = this.get(bitIndex);
            const bitValue = array[index];

            if (bitValue && !bitWasSet) {
                this.setBitCount++;
            } else if (!bitValue && bitWasSet) {
                this.setBitCount--;
            }
            if (array[index]) {
                this.buffer[byteIndex] |= bitMask;
            } else {
                this.buffer[byteIndex] &= ~bitMask;
            }

            if (bitMask === 1) {
                byteIndex += 1;

                if (byteIndex >= this.buffer.length) {
                    break;
                }

                bitMask = 0b1000_0000;
            } else {
                bitMask >>= 1;
            }
        }
    }

    /**
     * Loop through the bits in the bitfield.
     *
     * @param callbackfn Function to be called with the bit value and index.
     * @param start Index of the first bit to look at.
     * @param end Index of the first bit that should no longer be considered.
     */
    forEach(
        callbackfn: (bit: boolean, index: number) => void,
        start = 0,
        end = this.buffer.length * 8,
    ): void {
        let byteIndex = start >> 3;
        let bitMask = 0b1000_0000 >> start % 8;

        for (let bitIndex = start; bitIndex < end; bitIndex++) {
            callbackfn(!!(this.buffer[byteIndex] & bitMask), bitIndex);

            if (bitMask === 1) {
                byteIndex += 1;
                bitMask = 0b1000_0000;
            } else {
                bitMask >>= 1;
            }
        }
    }

    /**
     * Check if all bits in the Bitfield are unset.
     *
     * @returns A boolean indicating whether all bits are unset.
     */
    isEmpty(): boolean {
        for (let i = 0; i < this.buffer.length; i++) {
            if (this.buffer[i] !== 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get the count of bits set to 1.
     *
     * @returns The number of bits set to 1.
     */
    getSetBitCount(): number {
        return this.setBitCount;
    }
}
