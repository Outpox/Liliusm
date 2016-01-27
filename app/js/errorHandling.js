function noSelectedDiskErrorHandle() {
    noSelectedDiskError = selectList.val() == null;
    if (noSelectedDiskError) {
        noSelectedDiskErrorEl.show();
    }
    else {
        noSelectedDiskErrorEl.hide();
    }
}

function noSelectedFileErrorHandle() {
    console.log(document.getElementById('inputFile').files);
    noSelectedFileError = document.getElementById('inputFile').files[0] == undefined;
    if (noSelectedFileError) {
        noSelectedFileErrorEl.show();
    }
    else {
        noSelectedFileErrorEl.hide();
    }
}