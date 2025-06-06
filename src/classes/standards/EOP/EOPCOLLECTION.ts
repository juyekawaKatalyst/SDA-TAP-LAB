// automatically generated by the FlatBuffers compiler, do not modify

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import * as flatbuffers from 'flatbuffers';

import { EOP, EOPT } from './EOP.js';


/**
 * Collection of EOP records
 */
export class EOPCOLLECTION implements flatbuffers.IUnpackableObject<EOPCOLLECTIONT> {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
  __init(i:number, bb:flatbuffers.ByteBuffer):EOPCOLLECTION {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsEOPCOLLECTION(bb:flatbuffers.ByteBuffer, obj?:EOPCOLLECTION):EOPCOLLECTION {
  return (obj || new EOPCOLLECTION()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsEOPCOLLECTION(bb:flatbuffers.ByteBuffer, obj?:EOPCOLLECTION):EOPCOLLECTION {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new EOPCOLLECTION()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

RECORDS(index: number, obj?:EOP):EOP|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? (obj || new EOP()).__init(this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4), this.bb!) : null;
}

recordsLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

static startEOPCOLLECTION(builder:flatbuffers.Builder) {
  builder.startObject(1);
}

static addRecords(builder:flatbuffers.Builder, RECORDSOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, RECORDSOffset, 0);
}

static createRecordsVector(builder:flatbuffers.Builder, data:flatbuffers.Offset[]):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addOffset(data[i]!);
  }
  return builder.endVector();
}

static startRecordsVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static endEOPCOLLECTION(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createEOPCOLLECTION(builder:flatbuffers.Builder, RECORDSOffset:flatbuffers.Offset):flatbuffers.Offset {
  EOPCOLLECTION.startEOPCOLLECTION(builder);
  EOPCOLLECTION.addRecords(builder, RECORDSOffset);
  return EOPCOLLECTION.endEOPCOLLECTION(builder);
}

unpack(): EOPCOLLECTIONT {
  return new EOPCOLLECTIONT(
    this.bb!.createObjList<EOP, EOPT>(this.RECORDS.bind(this), this.recordsLength())
  );
}


unpackTo(_o: EOPCOLLECTIONT): void {
  _o.RECORDS = this.bb!.createObjList<EOP, EOPT>(this.RECORDS.bind(this), this.recordsLength());
}
}

export class EOPCOLLECTIONT implements flatbuffers.IGeneratedObject {
constructor(
  public RECORDS: (EOPT)[] = []
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  const RECORDS = EOPCOLLECTION.createRecordsVector(builder, builder.createObjectOffsetList(this.RECORDS));

  return EOPCOLLECTION.createEOPCOLLECTION(builder,
    RECORDS
  );
}
}
