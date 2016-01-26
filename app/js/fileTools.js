/**
 * Awesome function which lets you determine precisely the type of a file.
 * Tough it doesn't seem to be very efficient with large files.
 * Source: http://stackoverflow.com/a/29672957/3560404
 * @param callback { function } - File type verified or not
 */
function verifyFileTypeByHeader(callback) {
    var fileReader = new FileReader();
    fileReader.onloadend = function (e) {
        var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
        var header = "";
        for (var i = 0; i < arr.length; i++) {
            header += arr[i].toString(16);
        }
        //.iso header : 43 44 30 30 31
        //.png header : 89 50 (for testing purposes)
        //.exe header : 4D 5A (for testing purposes)
        //We're looking for the header type at the beginning of the file header so it must return 0
        callback(header.indexOf('8950') == 0 || header.indexOf('4d5a') == 0 || header.indexOf('4344') == 0);
    };
    fileReader.readAsArrayBuffer(file);
}

/**
 * Verifying the mime type. Tough ISO mime type is not reliable so I added a fallback which verifies the file extension.
 * File extension source: http://stackoverflow.com/a/1203361/3560404
 * @returns { Boolean } - Verified or not
 */
function verifyFileTypeByMime() {
    if (file.type.match(/^(application\/iso-image|application\/octet-stream|application\/octetstream)$/)) {
        return true;
    }
    else {
        var ext = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2);
        return ext.match(/^(iso|exe)$/) !== null;
    }
}

/**
 * Check if the file size isn't bigger than the disk size
 */
function verifyFileSize() {
    if (selectedDisk !== undefined && file !== undefined) {
        if (selectedDisk.realSize < file.size) {
            fileSizeErrorEl.show();
            fileSizeError = true;
        }
        else {
            fileSizeErrorEl.hide();
            setFileError(false);
            fileSizeError = false;
        }
    }
}
/**
 * Verify the file type
 */
function verifyFileType() {
    if (selectedDisk !== undefined && file !== undefined) {
        filePath.val(file.path);
        validFile = verifyFileTypeByMime();
        fileTypeError = !validFile;
        if (validFile) {
            fileTypeErrorEl.hide();
        }
        else {
            fileTypeErrorEl.show();
        }
    }
}

/**
 * Change the file <input> classes depending of the errors states
 */
function setFileError() {
    filePath[0].className = (!fileSizeError && !fileTypeError) ? 'file-path validate valid' : 'file-path validate invalid';
}

//Event listeners
selectList.on('change', function (e) {
    diskList.forEach(function (disk) {
        if (selectList.val() == disk.path) {
            selectedDisk = disk;
        }
    });
    verifyFileType();
    verifyFileSize();
});

inputFile.on('change', function (e) {
    e.preventDefault();
    if (document.getElementById('inputFile').files[0]) {
        file = document.getElementById('inputFile').files[0];
        console.log(file);
        verifyFileType();
        verifyFileSize();
    }
    return false;
});