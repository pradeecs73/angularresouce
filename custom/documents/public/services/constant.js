/*
 * <Author:Akash Gupta>
 * <Date:29-07-2016>
 * <constants: for documents list,edit, add page>
 */

angular.module('mean.documents').constant('DOCUMENT', {
    PATH: {
    	DOCUMENT_CATEGORY_ADD: '/documentCategory/add',
        DOCUMENT_LIST:'/document-list',
        DOCUMENT_ADD :'/document/add',
        DOCUMENT_EDIT :'/document/:documentId/edit',
    	DOCUMENT_CATEGORY_EDIT: '/documentCategory/:documentCategoryId/edit',
    	DOCUMENT_CATEGORY_LIST: '/documentCategory'
    },
    FILE_PATH: {
    	DOCUMENT_CATEGORY_ADD: 'documents/views/document-category-create.html',
    	DOCUMENT_CATEGORY_EDIT: 'documents/views/document-category-edit.html',
    	DOCUMENT_CATEGORY_LIST: 'documents/views/document-category-list.html',
        DOCUMENT_LIST:'documents/views/documents.html',
        DOCUMENT_ADD: 'documents/views/document-add.html',
        DOCUMENT_EDIT: 'documents/views/document-edit.html'
    },
    STATE: {
    	DOCUMENT_CATEGORY_ADD: 'Document category_create document category',
    	DOCUMENT_CATEGORY_EDIT: 'Document category_update document category',
    	DOCUMENT_CATEGORY_LIST: 'Document category_all document categories',
        DOCUMENT_LIST: 'Document document list',
        DOCUMENT_ADD:'Document document add',
        DOCUMENT_EDIT:'Document document edit'
    }
});