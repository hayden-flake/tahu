"use strict";
/********************************************************************************
 * Copyright (c) 2016-2018 Cirrus Link Solutions and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Cirrus Link Solutions - initial implementation
 ********************************************************************************/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodePayload = exports.encodePayload = void 0;
console.log("using pre-built sparkplug-payload package from Hayden's Github");
const ProtoRoot = __importStar(require("./sparkplugPayloadProto"));
const long_1 = __importDefault(require("long"));
const protobuf = __importStar(require("protobufjs"));
protobuf.util.Long = long_1.default;
protobuf.configure();
const Payload = ProtoRoot.org.eclipse.tahu.protobuf.Payload;
const Template = Payload.Template;
const Parameter = Template.Parameter;
const DataSet = Payload.DataSet;
const DataSetValue = DataSet.DataSetValue;
const Row = DataSet.Row;
const PropertyValue = Payload.PropertyValue;
const PropertySet = Payload.PropertySet;
const PropertySetList = Payload.PropertySetList;
const MetaData = Payload.MetaData;
const Metric = Payload.Metric;
/**
 * Sets the value of an object given it's type expressed as an integer
 *
 * only used during encode functions
 */
function setValue(type, value, object) {
    // TODO not sure about type casts
    switch (type) {
        case 1: // Int8
            if (value >= 0) {
                object.intValue = value;
                break;
            }
            object.intValue = value + 2 ** 8;
            break;
        case 2: // Int16
            if (value >= 0) {
                object.intValue = value;
                break;
            }
            object.intValue = value + 2 ** 16;
            break;
        case 3: // Int32
            if (value >= 0) {
                object.intValue = value;
                break;
            }
            object.intValue = value + 2 ** 32;
            break;
        case 5: // UInt8
        case 6: // UInt16
        case 7: // UInt32
            object.intValue = value;
            break;
        case 4: // Int64
            if (value >= 0) {
                object.longValue = long_1.default.fromNumber(value, true);
                break;
            }
            object.longValue = long_1.default.MAX_UNSIGNED_VALUE.add(value + 1);
            break;
        case 8: // UInt64
        case 13: // DateTime
            object.longValue = new long_1.default(value);
            break;
        case 9: // Float
            object.floatValue = value;
            break;
        case 10: // Double
            object.doubleValue = value;
            break;
        case 11: // Boolean
            object.booleanValue = value;
            break;
        case 12: // String
        case 14: // Text
        case 15: // UUID
            object.stringValue = value;
            break;
        case 16: // DataSet
            object.datasetValue = encodeDataSet(value);
            break;
        case 17: // Bytes
        case 18: // File
            object.bytesValue = value;
            break;
        case 19: // Template
            object.templateValue = encodeTemplate(value);
            break;
        case 20: // PropertySet
            object.propertysetValue = encodePropertySet(value);
            break;
        case 21:
            object.propertysetsValue = encodePropertySetList(value);
            break;
        case 22:
            object.bytesValue = encodeInt8Array(value);
            break;
        case 23:
            object.bytesValue = encodeInt16Array(value);
            break;
        case 24:
            object.bytesValue = encodeInt32Array(value);
            break;
        case 26:
            object.bytesValue = encodeUInt8Array(value);
            break;
        case 27:
            object.bytesValue = encodeUInt16Array(value);
            break;
        case 28:
            object.bytesValue = encodeUInt32Array(value);
            break;
        case 30:
            object.bytesValue = encodeFloatArray(value);
            break;
        case 31:
            object.bytesValue = encodeDoubleArray(value);
            break;
        case 32:
            object.bytesValue = encodeBooleanArray(value);
            break;
        case 33:
            object.bytesValue = encodeStringArray(value);
            break;
    }
}
/** only used during decode functions */
function getValue(type, object) {
    // TODO change type casts
    switch (type) {
        case 1: // Int8
            return (object.intValue << 24 >> 24); // Convert to signed 8-bit integer
        case 2: // Int16
            return (object.intValue << 16 >> 16); // Convert to signed 16-bit integer
        case 3: // Int32
            return (object.intValue | 0); // Convert to signed 32-bit integer
        case 5: // UInt8
        case 6: // UInt16
        case 7: // UInt32
            return object.intValue;
        case 4: // Int64
            if (object.longValue instanceof long_1.default) {
                if (object.longValue.compare(long_1.default.MAX_VALUE) === 1) {
                    const signed = object.longValue.subtract(long_1.default.MAX_UNSIGNED_VALUE).subtract(1);
                    signed.unsigned = false;
                    return signed.toNumber();
                }
                return object.longValue.toNumber();
            }
            return object.longValue;
        case 8: // UInt64
            if (object.longValue instanceof long_1.default) {
                return object.longValue.toNumber();
            }
            return object.longValue;
        case 13: // DateTime
            return object.longValue;
        case 9: // Float
            return object.floatValue;
        case 10: // Double
            return object.doubleValue;
        case 11: // Boolean
            return object.booleanValue;
        case 12: // String
        case 14: // Text
        case 15: // UUID
            return object.stringValue;
        case 16: // DataSet
            return decodeDataSet(object.datasetValue);
        case 17: // Bytes
        case 18: // File
            return object.bytesValue;
        case 19: // Template
            return decodeTemplate(object.templateValue);
        case 20: // PropertySet
            return decodePropertySet(object.propertysetValue);
        case 21:
            return decodePropertySetList(object.propertysetsValue);
        case 22:
            return decodeInt8Array(object.bytesValue);
        case 23:
            return decodeInt16Array(object.bytesValue);
        case 24:
            return decodeInt32Array(object.bytesValue);
        case 26:
            return decodeUInt8Array(object.bytesValue);
        case 27:
            return decodeUInt16Array(object.bytesValue);
        case 28:
            return decodeUInt32Array(object.bytesValue);
        case 30:
            return decodeFloatArray(object.bytesValue);
        case 31:
            return decodeDoubleArray(object.bytesValue);
        case 32:
            return decodeBooleanArray(object.bytesValue);
        case 33:
            return decodeStringArray(object.bytesValue);
        default:
            return null;
    }
}
function isSet(value) {
    return value !== null && value !== undefined;
}
function getDataSetValue(type, object) {
    switch (type) {
        case 7: // UInt32
            if (object.longValue instanceof long_1.default)
                return object.longValue.toInt();
            else if (isSet(object.longValue))
                return object.longValue;
        case 4: // UInt64
            if (isSet(object.longValue))
                return object.longValue;
        case 9: // Float
            if (isSet(object.floatValue))
                return object.floatValue;
        case 10: // Double
            if (isSet(object.doubleValue))
                return object.doubleValue;
        case 11: // Boolean
            if (isSet(object.booleanValue))
                return object.booleanValue;
        case 12: // String
            if (isSet(object.stringValue))
                return object.stringValue;
        default:
            throw new Error(`Invalid DataSetValue: ${JSON.stringify(object)}`);
    }
}
function getTemplateParamValue(type, object) {
    switch (type) {
        case 7: // UInt32
            if (object.longValue instanceof long_1.default)
                return object.longValue.toInt();
            else if (isSet(object.longValue))
                return object.longValue;
        case 4: // UInt64
            if (isSet(object.longValue))
                return object.longValue;
        case 9: // Float
            if (isSet(object.floatValue))
                return object.floatValue;
        case 10: // Double
            if (isSet(object.doubleValue))
                return object.doubleValue;
        case 11: // Boolean
            if (isSet(object.booleanValue))
                return object.booleanValue;
        case 12: // String
            if (isSet(object.stringValue))
                return object.stringValue;
        default:
            throw new Error(`Invalid Parameter value: ${JSON.stringify(object)}`);
    }
}
/** transforms a user friendly type and converts it to its corresponding type code */
function encodeType(typeString) {
    switch (typeString.toUpperCase()) {
        case "INT8":
            return 1;
        case "INT16":
            return 2;
        case "INT32":
        case "INT":
            return 3;
        case "INT64":
        case "LONG":
            return 4;
        case "UINT8":
            return 5;
        case "UINT16":
            return 6;
        case "UINT32":
            return 7;
        case "UINT64":
            return 8;
        case "FLOAT":
            return 9;
        case "DOUBLE":
            return 10;
        case "BOOLEAN":
            return 11;
        case "STRING":
            return 12;
        case "DATETIME":
            return 13;
        case "TEXT":
            return 14;
        case "UUID":
            return 15;
        case "DATASET":
            return 16;
        case "BYTES":
            return 17;
        case "FILE":
            return 18;
        case "TEMPLATE":
            return 19;
        case "PROPERTYSET":
            return 20;
        case "PROPERTYSETLIST":
            return 21;
        case "INT8ARRAY":
            return 22;
        case "INT16ARRAY":
            return 23;
        case "INT32ARRAY":
            return 24;
        case "UINT8ARRAY":
            return 26;
        case "UINT16ARRAY":
            return 27;
        case "UINT32ARRAY":
            return 28;
        case "FLOATARRAY":
            return 30;
        case "DOUBLEARRAY":
            return 31;
        case "BOOLEANARRAY":
            return 32;
        case "STRINGARRAY":
            return 33;
        default:
            return 0;
    }
}
/** transforms a type code into a user friendly type */
// @ts-expect-error TODO no consistent return
function decodeType(typeInt) {
    switch (typeInt) {
        case 1:
            return "Int8";
        case 2:
            return "Int16";
        case 3:
            return "Int32";
        case 4:
            return "Int64";
        case 5:
            return "UInt8";
        case 6:
            return "UInt16";
        case 7:
            return "UInt32";
        case 8:
            return "UInt64";
        case 9:
            return "Float";
        case 10:
            return "Double";
        case 11:
            return "Boolean";
        case 12:
            return "String";
        case 13:
            return "DateTime";
        case 14:
            return "Text";
        case 15:
            return "UUID";
        case 16:
            return "DataSet";
        case 17:
            return "Bytes";
        case 18:
            return "File";
        case 19:
            return "Template";
        case 20:
            return "PropertySet";
        case 21:
            return "PropertySetList";
        case 22:
            return "Int8Array";
        case 23:
            return "Int16Array";
        case 24:
            return "Int32Array";
        case 26:
            return "UInt8Array";
        case 27:
            return "UInt16Array";
        case 28:
            return "UInt32Array";
        case 30:
            return "FloatArray";
        case 31:
            return "DoubleArray";
        case 32:
            return "BooleanArray";
        case 33:
            return "StringArray";
    }
}
function encodeTypes(typeArray) {
    var types = [];
    for (var i = 0; i < typeArray.length; i++) {
        types.push(encodeType(typeArray[i]));
    }
    return types;
}
function decodeTypes(typeArray) {
    var types = [];
    for (var i = 0; i < typeArray.length; i++) {
        types.push(decodeType(typeArray[i]));
    }
    return types;
}
function encodeDataSet(object) {
    const num = object.numOfColumns, names = object.columns, types = encodeTypes(object.types), rows = object.rows, newDataSet = DataSet.create({
        "numOfColumns": num,
        "columns": object.columns,
        "types": types
    }), newRows = [];
    // Loop over all the rows
    for (let i = 0; i < rows.length; i++) {
        const newRow = Row.create(), row = rows[i], elements = [];
        // Loop over all the elements in each row
        // @ts-expect-error TODO check if num is set
        for (let t = 0; t < num; t++) {
            const newValue = DataSetValue.create();
            setValue(types[t], row[t], newValue);
            elements.push(newValue);
        }
        newRow.elements = elements;
        newRows.push(newRow);
    }
    newDataSet.rows = newRows;
    return newDataSet;
}
function decodeDataSet(protoDataSet) {
    const protoTypes = protoDataSet.types; // TODO check exists
    const dataSet = {
        types: decodeTypes(protoTypes),
        rows: [],
    };
    const types = decodeTypes(protoTypes), protoRows = protoDataSet.rows || [], // TODO check exists
    num = protoDataSet.numOfColumns;
    // Loop over all the rows
    for (var i = 0; i < protoRows.length; i++) {
        var protoRow = protoRows[i], protoElements = protoRow.elements || [], // TODO check exists
        rowElements = [];
        // Loop over all the elements in each row
        // @ts-expect-error TODO check exists
        for (var t = 0; t < num; t++) {
            rowElements.push(getDataSetValue(protoTypes[t], protoElements[t]));
        }
        dataSet.rows.push(rowElements);
    }
    dataSet.numOfColumns = num;
    dataSet.types = types;
    dataSet.columns = protoDataSet.columns;
    return dataSet;
}
function encodeMetaData(object) {
    var metadata = MetaData.create(), isMultiPart = object.isMultiPart, contentType = object.contentType, size = object.size, seq = object.seq, fileName = object.fileName, fileType = object.fileType, md5 = object.md5, description = object.description;
    if (isMultiPart !== undefined && isMultiPart !== null) {
        metadata.isMultiPart = isMultiPart;
    }
    if (contentType !== undefined && contentType !== null) {
        metadata.contentType = contentType;
    }
    if (size !== undefined && size !== null) {
        metadata.size = size;
    }
    if (seq !== undefined && seq !== null) {
        metadata.seq = seq;
    }
    if (fileName !== undefined && fileName !== null) {
        metadata.fileName = fileName;
    }
    if (fileType !== undefined && fileType !== null) {
        metadata.fileType = fileType;
    }
    if (md5 !== undefined && md5 !== null) {
        metadata.md5 = md5;
    }
    if (description !== undefined && description !== null) {
        metadata.description = description;
    }
    return metadata;
}
function decodeMetaData(protoMetaData) {
    var metadata = {}, isMultiPart = protoMetaData.isMultiPart, contentType = protoMetaData.contentType, size = protoMetaData.size, seq = protoMetaData.seq, fileName = protoMetaData.fileName, fileType = protoMetaData.fileType, md5 = protoMetaData.md5, description = protoMetaData.description;
    if (isMultiPart !== undefined && isMultiPart !== null) {
        metadata.isMultiPart = isMultiPart;
    }
    if (contentType !== undefined && contentType !== null) {
        metadata.contentType = contentType;
    }
    if (size !== undefined && size !== null) {
        metadata.size = size;
    }
    if (seq !== undefined && seq !== null) {
        metadata.seq = seq;
    }
    if (fileName !== undefined && fileName !== null) {
        metadata.fileName = fileName;
    }
    if (fileType !== undefined && fileType !== null) {
        metadata.fileType = fileType;
    }
    if (md5 !== undefined && md5 !== null) {
        metadata.md5 = md5;
    }
    if (description !== undefined && description !== null) {
        metadata.description = description;
    }
    return metadata;
}
function encodePropertyValue(object) {
    var type = encodeType(object.type), newPropertyValue = PropertyValue.create({
        "type": type
    });
    if (object.value !== undefined && object.value === null) {
        newPropertyValue.isNull = true;
    }
    setValue(type, object.value, newPropertyValue);
    return newPropertyValue;
}
function decodePropertyValue(protoValue) {
    const propertyValue = {
        // @ts-expect-error TODO check exists
        value: getValue(protoValue.type, protoValue),
        type: decodeType(protoValue.type),
    };
    if (protoValue.isNull !== undefined && protoValue.isNull === true) {
        propertyValue.value = null;
    }
    else {
        propertyValue.value = getValue(protoValue.type, protoValue);
    }
    propertyValue.type = decodeType(protoValue.type);
    return propertyValue;
}
function encodePropertySet(object) {
    const keys = [], values = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            keys.push(key);
            values.push(encodePropertyValue(object[key]));
        }
    }
    return PropertySet.create({
        "keys": keys,
        "values": values
    });
}
function decodePropertySet(protoSet) {
    const propertySet = {}, protoKeys = protoSet.keys || [], // TODO check exists
    protoValues = protoSet.values || []; // TODO check exists
    for (var i = 0; i < protoKeys.length; i++) {
        propertySet[protoKeys[i]] = decodePropertyValue(protoValues[i]);
    }
    return propertySet;
}
function encodePropertySetList(object) {
    const propertySets = [];
    for (let i = 0; i < object.length; i++) {
        propertySets.push(encodePropertySet(object[i]));
    }
    return PropertySetList.create({
        "propertyset": propertySets
    });
}
function decodePropertySetList(protoSetList) {
    const propertySets = [], protoSets = protoSetList.propertyset || []; // TODO check exists
    for (let i = 0; i < protoSets.length; i++) {
        propertySets.push(decodePropertySet(protoSets[i]));
    }
    return propertySets;
}
function encodeParameter(object) {
    const type = encodeType(object.type), newParameter = Parameter.create({
        "name": object.name,
        "type": type
    });
    setValue(type, object.value, newParameter);
    return newParameter;
}
function decodeParameter(protoParameter) {
    const protoType = protoParameter.type, parameter = {
        value: getTemplateParamValue(protoType, protoParameter),
        type: decodeType(protoType),
    };
    parameter.name = protoParameter.name;
    parameter.type = decodeType(protoType);
    // @ts-expect-error TODO check exists
    parameter.value = getValue(protoType, protoParameter);
    return parameter;
}
function encodeTemplate(object) {
    let template = Template.create(), metrics = object.metrics, parameters = object.parameters, isDef = object.isDefinition, ref = object.templateRef, version = object.version;
    if (version !== undefined && version !== null) {
        template.version = version;
    }
    if (ref !== undefined && ref !== null) {
        template.templateRef = ref;
    }
    if (isDef !== undefined && isDef !== null) {
        template.isDefinition = isDef;
    }
    // Build up the metric
    if (object.metrics !== undefined && object.metrics !== null) {
        const newMetrics = [];
        metrics = object.metrics;
        // loop over array of metrics
        for (let i = 0; i < metrics.length; i++) {
            newMetrics.push(encodeMetric(metrics[i]));
        }
        template.metrics = newMetrics;
    }
    // Build up the parameters
    if (object.parameters !== undefined && object.parameters !== null) {
        const newParameter = [];
        // loop over array of parameters
        for (let i = 0; i < object.parameters.length; i++) {
            newParameter.push(encodeParameter(object.parameters[i]));
        }
        template.parameters = newParameter;
    }
    return template;
}
function decodeTemplate(protoTemplate) {
    const template = {}, protoMetrics = protoTemplate.metrics, protoParameters = protoTemplate.parameters, isDef = protoTemplate.isDefinition, ref = protoTemplate.templateRef, version = protoTemplate.version;
    if (version !== undefined && version !== null) {
        template.version = version;
    }
    if (ref !== undefined && ref !== null) {
        template.templateRef = ref;
    }
    if (isDef !== undefined && isDef !== null) {
        template.isDefinition = isDef;
    }
    // Build up the metric
    if (protoMetrics !== undefined && protoMetrics !== null) {
        const metrics = [];
        // loop over array of proto metrics, decoding each one
        for (let i = 0; i < protoMetrics.length; i++) {
            metrics.push(decodeMetric(protoMetrics[i]));
        }
        template.metrics = metrics;
    }
    // Build up the parameters
    if (protoParameters !== undefined && protoParameters !== null) {
        const parameter = [];
        // loop over array of parameters
        for (let i = 0; i < protoParameters.length; i++) {
            parameter.push(decodeParameter(protoParameters[i]));
        }
        template.parameters = parameter;
    }
    return template;
}
function encodeStringArray(array) {
    return Buffer.from(array.join("\0") + '\0', 'utf8');
}
function decodeStringArray(packedBytes) {
    if (packedBytes === null) {
        return null;
    }
    return (Buffer.from(packedBytes).toString('utf8')).replace(/\0$/, '').split('\x00');
}
function encodeInt8Array(array) {
    return packValues(array, 'b');
}
function decodeInt8Array(array) {
    if (array === null) {
        return null;
    }
    return unpackValues(array, 'b');
}
function encodeUInt8Array(array) {
    return packValues(array, 'B');
}
function decodeUInt8Array(array) {
    if (array === null) {
        return null;
    }
    return unpackValues(array, 'B');
}
function encodeInt16Array(array) {
    return packValues(array, 'h');
}
function decodeInt16Array(array) {
    if (array === null) {
        return null;
    }
    return unpackValues(array, 'h');
}
function encodeUInt16Array(array) {
    return packValues(array, 'H');
}
function decodeUInt16Array(array) {
    if (array === null) {
        return null;
    }
    return unpackValues(array, 'H');
}
function encodeInt32Array(array) {
    return packValues(array, 'i');
}
function decodeInt32Array(array) {
    if (array === null) {
        return null;
    }
    return unpackValues(array, 'i');
}
function encodeUInt32Array(array) {
    return packValues(array, 'I');
}
function decodeUInt32Array(array) {
    if (array === null) {
        return null;
    }
    return unpackValues(array, 'I');
}
function encodeFloatArray(array) {
    return packValues(array, 'f');
}
function decodeFloatArray(array) {
    if (array === null) {
        return null;
    }
    return unpackValues(array, 'f');
}
function encodeDoubleArray(array) {
    return packValues(array, 'd');
}
function decodeDoubleArray(array) {
    if (array === null) {
        return null;
    }
    return unpackValues(array, 'd');
}
function unpackValues(packed_bytes, format_specifier) {
    const data_view = new DataView(packed_bytes.buffer, packed_bytes.byteOffset, packed_bytes.byteLength);
    const decodeFunc = {
        'b': data_view.getInt8.bind(data_view),
        'B': data_view.getUint8.bind(data_view),
        'h': data_view.getInt16.bind(data_view, 0, true),
        'H': data_view.getUint16.bind(data_view, 0, true),
        'i': data_view.getInt32.bind(data_view, 0, true),
        'I': data_view.getUint32.bind(data_view, 0, true),
        'f': data_view.getFloat32.bind(data_view, 0, true),
        'd': data_view.getFloat64.bind(data_view, 0, true),
    }[format_specifier];
    if (!decodeFunc) {
        throw new Error(`Unsupported format specifier: ${format_specifier}`);
    }
    const values = [];
    const typeSize = getTypeSize(format_specifier);
    for (let i = 0; i < packed_bytes.length / typeSize; i++) {
        values.push(decodeFunc(i * typeSize));
    }
    return values;
}
function packValues(values, format_specifier) {
    const dataView = new DataView(new ArrayBuffer(values.length * getTypeSize(format_specifier)));
    let byteOffset = 0;
    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        switch (format_specifier) {
            case 'b':
                dataView.setInt8(byteOffset, value);
                byteOffset += 1;
                break;
            case 'B':
                dataView.setUint8(byteOffset, value);
                byteOffset += 1;
                break;
            case 'h':
                dataView.setInt16(byteOffset, value, true);
                byteOffset += 2;
                break;
            case 'H':
                dataView.setUint16(byteOffset, value, true);
                byteOffset += 2;
                break;
            case 'i':
                dataView.setInt32(byteOffset, value, true);
                byteOffset += 4;
                break;
            case 'I':
                dataView.setUint32(byteOffset, value, true);
                byteOffset += 4;
                break;
            case 'f':
                dataView.setFloat32(byteOffset, value, true);
                byteOffset += 4;
                break;
            case 'd':
                dataView.setFloat64(byteOffset, value, true);
                byteOffset += 8;
                break;
            default:
                throw new Error(`Unsupported format specifier: ${format_specifier}`);
        }
    }
    return new Uint8Array(dataView.buffer);
}
function getTypeSize(format_specifier) {
    const sizeMap = {
        'b': 1,
        'B': 1,
        'h': 2,
        'H': 2,
        'i': 4,
        'I': 4,
        'f': 4,
        'd': 8,
    };
    const size = sizeMap[format_specifier];
    if (!size) {
        throw new Error(`Unsupported format specifier: ${format_specifier}`);
    }
    return size;
}
function encodeBooleanArray(booleanArray) {
    // calculate the number of packed bytes required
    const packedBytesCount = Math.ceil(booleanArray.length / 8);
    // convert the boolean array into a packed byte array
    const packedBytes = new Uint8Array(packedBytesCount);
    for (let i = 0; i < booleanArray.length; i++) {
        const value = booleanArray[i];
        const byteIndex = Math.floor(i / 8);
        const bitIndex = i % 8;
        packedBytes[byteIndex] |= (value ? 1 : 0) << bitIndex;
    }
    // return the packed bytes preceded by a 4-byte integer representing the number of boolean values
    const lengthBytes = new Uint8Array(new Uint32Array([booleanArray.length]).buffer);
    const result = new Uint8Array(lengthBytes.length + packedBytes.length);
    result.set(lengthBytes);
    result.set(packedBytes, lengthBytes.length);
    return result;
}
function decodeBooleanArray(packedBytes) {
    // extract the length of the boolean array from the first 4 bytes of the packed bytes
    const lengthBytes = packedBytes.slice(0, 4);
    const length = new Uint32Array(lengthBytes.buffer)[0];
    // create a boolean array of the appropriate length
    const booleanArray = new Array(length);
    // iterate over each bit in the packed bytes and set the corresponding boolean value in the boolean array
    for (let i = 0; i < length; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = i % 8;
        const mask = 1 << bitIndex;
        booleanArray[i] = (packedBytes[byteIndex + 4] & mask) !== 0;
    }
    return booleanArray;
}
function encodeMetric(metric) {
    const newMetric = Metric.create({
        name: metric.name
    }), value = metric.value, datatype = encodeType(metric.type), alias = metric.alias, isHistorical = metric.isHistorical, isTransient = metric.isTransient, metadata = metric.metadata, timestamp = metric.timestamp, properties = metric.properties;
    // Get metric type and value
    newMetric.datatype = datatype;
    setValue(datatype, value, newMetric);
    if (timestamp !== undefined && timestamp !== null) {
        newMetric.timestamp = timestamp;
    }
    if (alias !== undefined && alias !== null) {
        newMetric.alias = alias;
    }
    if (isHistorical !== undefined && isHistorical !== null) {
        newMetric.isHistorical = isHistorical;
    }
    if (isTransient !== undefined && isTransient !== null) {
        newMetric.isTransient = isTransient;
    }
    if (value !== undefined && value === null) {
        newMetric.isNull = true;
    }
    if (metadata !== undefined && metadata !== null) {
        newMetric.metadata = encodeMetaData(metadata);
    }
    if (properties !== undefined && properties !== null) {
        newMetric.properties = encodePropertySet(properties);
    }
    return newMetric;
}
function decodeMetric(protoMetric) {
    const metric = {
        // @ts-expect-error TODO check exists
        value: getValue(protoMetric.datatype, protoMetric),
        type: decodeType(protoMetric.datatype)
    };
    if (protoMetric.hasOwnProperty("name")) {
        metric.name = protoMetric.name;
    }
    if (protoMetric.hasOwnProperty("isNull") && protoMetric.isNull === true) {
        metric.value = null;
    }
    else {
        // @ts-expect-error TODO check exists
        metric.value = getValue(protoMetric.datatype, protoMetric);
    }
    if (protoMetric.hasOwnProperty("timestamp")) {
        if (protoMetric.timestamp instanceof long_1.default) {
            metric.timestamp = protoMetric.timestamp.toNumber();
        }
        else {
            metric.timestamp = protoMetric.timestamp;
        }
    }
    if (protoMetric.hasOwnProperty("alias")) {
        metric.alias = protoMetric.alias;
    }
    if (protoMetric.hasOwnProperty("isHistorical")) {
        metric.isHistorical = protoMetric.isHistorical;
    }
    if (protoMetric.hasOwnProperty("isTransient")) {
        metric.isTransient = protoMetric.isTransient;
    }
    if (protoMetric.hasOwnProperty("metadata") && protoMetric.metadata) {
        metric.metadata = decodeMetaData(protoMetric.metadata);
    }
    if (protoMetric.hasOwnProperty("properties") && protoMetric.properties) {
        metric.properties = decodePropertySet(protoMetric.properties);
    }
    return metric;
}
function encodePayload(object) {
    var payload = Payload.create({
        "timestamp": object.timestamp
    });
    // Build up the metric
    if (object.metrics !== undefined && object.metrics !== null) {
        var newMetrics = [], metrics = object.metrics;
        // loop over array of metric
        for (var i = 0; i < metrics.length; i++) {
            newMetrics.push(encodeMetric(metrics[i]));
        }
        payload.metrics = newMetrics;
    }
    if (object.seq !== undefined && object.seq !== null) {
        payload.seq = object.seq;
    }
    if (object.uuid !== undefined && object.uuid !== null) {
        payload.uuid = object.uuid;
    }
    if (object.body !== undefined && object.body !== null) {
        payload.body = object.body;
    }
    return Payload.encode(payload).finish();
}
exports.encodePayload = encodePayload;
function decodePayload(proto) {
    var sparkplugPayload = Payload.decode(proto), payload = {};
    if (sparkplugPayload.hasOwnProperty("timestamp")) {
        if (sparkplugPayload.timestamp instanceof long_1.default) {
            payload.timestamp = sparkplugPayload.timestamp.toNumber();
        }
        else {
            payload.timestamp = sparkplugPayload.timestamp;
        }
    }
    if (sparkplugPayload.hasOwnProperty("metrics")) {
        const metrics = [];
        for (var i = 0; i < sparkplugPayload.metrics.length; i++) {
            metrics.push(decodeMetric(sparkplugPayload.metrics[i]));
        }
        payload.metrics = metrics;
    }
    if (sparkplugPayload.hasOwnProperty("seq")) {
        if (sparkplugPayload.seq instanceof long_1.default) {
            payload.seq = sparkplugPayload.seq.toNumber();
        }
        else {
            payload.seq = sparkplugPayload.seq;
        }
    }
    if (sparkplugPayload.hasOwnProperty("uuid")) {
        payload.uuid = sparkplugPayload.uuid;
    }
    if (sparkplugPayload.hasOwnProperty("body")) {
        payload.body = sparkplugPayload.body;
    }
    return payload;
}
exports.decodePayload = decodePayload;
