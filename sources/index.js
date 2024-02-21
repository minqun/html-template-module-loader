const fs = require('fs')
const path = require('path')
const parseUtls = require('parse5-utils');
const deafultOptions = {
    tag: 'tpl',
    attr: 'file',
    tplTag: 'template',
    tplAttr: 'tpl'
}
function findNode(node, tag, attrName, result) {
    if (node.tagName === tag && node.attrs) {
        const attr = node.attrs.find((attr) => attr.name === attrName);
        if (attr) {
        result.push(node);
        }
    }
    if (node.childNodes) {
        for (const childNode of node.childNodes) {
        findNode(childNode, tag, attrName, result);
        }
    }
}
function getFileNode(file) {
    const content = fs.readFileSync(file, 'utf8')
    return parseUtls.parse(content)
}
function insertFileNodeToTargetNode (node, insertFile, insertTag, insertAttr, _this) {
    const options = Object.assign({}, deafultOptions,  _this.getOptions());
    const result = []
    const insertNode = getFileNode(insertFile)
    replaceTplToHtml(insertNode, options.tag, options.attr, _this)
    findNode(insertNode, options.tplTag, options.tplAttr, result)
    let newNode = parseUtls.createNode('div')
    newNode.childNodes = result[0].childNodes
    console.log(result, '---result---')
    parseUtls.replace(node, newNode)
}
function replaceTplToHtml(node, tag, attrName, _this) {
    const options = Object.assign({}, deafultOptions,  _this.getOptions());
    if (node.tagName === tag) {
        const src = node.attrs.find(attr => attr.name == options.attr).value;
        if (src) {
            _this.addDependency(path.resolve(src));
            insertFileNodeToTargetNode(node, path.resolve(src), options.tplTag, options.tplAttr, _this)
        }
    }
    if (node.childNodes) {
        for (const childNode of node.childNodes) {
            replaceTplToHtml(childNode, tag, attrName, _this);
        }
    }
}

module.exports = async function (source) {
    const options = Object.assign({}, deafultOptions,  this.getOptions());
    var callback = this.async();
    var document = parseUtls.parse(source)
    replaceTplToHtml(document, options.tag, options.attr, this)
    const html = parseUtls.serialize(document)
    callback(null, html)
}
module.exports.raw = false;