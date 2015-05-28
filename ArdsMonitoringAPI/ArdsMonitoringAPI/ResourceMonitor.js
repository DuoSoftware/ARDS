﻿var util = require('util');
var EventEmiter = require('events').EventEmitter;
var resourceHandler = require('../.././ArdsCommon/ArdsCommon/ResourceHandler.js');

var SearchResourceByTags = function (logkey, searchTags, callback) {
    resourceHandler.SearchResourcebyTags(logkey, searchTags, function (err, resourcelist) {
        if (err) {
            console.log(err);
            callback(err, []);
        }
        else {
            var returnlist = [];
            if (requestlist.length > 0) {
                callback(null, returnlist);
            }
            else {
                callback(null, returnlist);
            }
        }
    });
};

var GetAllResources = function (logkey, company, tenant, callback) {
    var searchTags = ["company_" + company, "tenant_" + tenant];
    SearchResourceByTags(logkey, searchTags, function (err, returnlist) {
        callback(err, returnlist);
    });
};

var GetResourceFilterByClassTypeCategory = function (logkey, company, tenant, reqclass, reqtype, reqcategory, callback) {
    var searchTags = ["company_" + company, "tenant_" + tenant, "class_" + reqclass, "type_" + reqtype, "category_" + reqcategory];
    SearchResourceByTags(logkey, searchTags, function (err, returnlist) {
        callback(err, returnlist);
    });
};

module.exports.GetAllResources = GetAllResources;
module.exports.GetResourceFilterByClassTypeCategory = GetResourceFilterByClassTypeCategory;