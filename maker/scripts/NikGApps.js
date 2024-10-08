// NikGApps Script

$('#extractButton').click(function() {
    console.log('NikGApps Selected.');
    document.getElementById("info").innerHTML += "NikGApps Selected. <br>";

    const fileInput = document.getElementById('zipFileInput');
    const files = fileInput.files;
    if (files.length === 0) {
        console.log('Please select a file to extract.');
        document.getElementById("info").innerHTML += "<b class='red'>Please select a file to extract!</p><br>";
        return;
    }
    

    const file = files[0];
    const reader = new FileReader();
    const newZip = new JSZip(); // Define newZip here
    let ogZipTitle = file.name; // Store the name of the original zip file
    let ogZipTitleStripped = ogZipTitle.replace('.zip',''); // Zip file with extentions removed 

    // main functons for specified files:
    reader.onload = function(e) {
        console.log('File loaded. Extracting...');
        document.getElementById("info").innerHTML += "File loaded. Extracting...<br>";
        const zip = new JSZip();
        zip.loadAsync(e.target.result).then(function(zipFiles) {
            const promises = [];
            zip.forEach(function(relativePath, zipEntry) {
                console.log('Processing file:', relativePath);
                document.getElementById("info").innerHTML += '<b>Processing file: </b>' + relativePath + '<br>';
                
                // Ensure only files from the AppSet folder are processed
                if (!relativePath.startsWith('AppSet/')) {
                    console.log('Skipping file outside AppSet folder:', relativePath);
                    document.getElementById("info").innerHTML += '<b>Skipping file outside AppSet folder: </b>' + relativePath + '<br>';
                    return; // Skip files not in the AppSet folder
                }
                
                // Skip installer.sh and uninstaller.sh files
                if (relativePath.endsWith('installer.sh') || relativePath.endsWith('uninstaller.sh')) {
                    console.log('Skipping file:', relativePath);
                    return;
                }
    
                promises.push(new Promise((resolve, reject) => {
                    if (relativePath.endsWith('.zip')) {
                        const subZip = new JSZip();
                        subZip.loadAsync(zipEntry.async('blob')).then(function(subZipFiles) {
                            subZip.forEach(function(subRelativePath, subZipEntry) {
                                const parts = subRelativePath.split('___').filter(Boolean);
                                const targetPath = ['system', ...parts].join('/');
                                console.log('Extracting to:', targetPath);
                                document.getElementById("info").innerHTML += '<b>Extracting File: </b>' + targetPath + '<br>';
                                subZipEntry.async('blob').then(function(blob) {
                                    newZip.file(targetPath, blob);
                                    resolve();
                                });
                            });
                        });
                    } else {
                        const parts = relativePath.split('___').filter(Boolean);
                        const targetPath = ['system', ...parts].join('/');
                        console.log('Extracting to:', targetPath);
                        document.getElementById("info").innerHTML += 'Creating new zip file...<br>';
                        zipEntry.async('blob').then(function(blob) {
                            newZip.file(targetPath, blob);
                            resolve();
                        });
                    }
                }));
            });
        
    
    
            
// Add contents of the 'template' folder to the new zip file
const templateFolder = {
    'customize.sh': 'customize.sh', 
    'uninstall.sh': 'uninstall.sh', 
    'META-INF/com/google/android/update-binary': 'META-INF/com/google/android/update-binary', 
    'META-INF/com/google/android/updater-script': 'META-INF/com/google/android/updater-script', 
    'common/functions.sh': 'common/functions.sh', 
    'common/install.sh': 'common/install.sh', 
};

Object.values(templateFolder).forEach(fileName => {
    // Assuming the files are in the same directory as your HTML file
    const filePath = './scripts/template/' + fileName;

    fetch(filePath)
        .then(response => response.blob())
        .then(blob => {
            // Convert blob to array buffer
            return new Response(blob).arrayBuffer();
        })
        .then(arrayBuffer => {
            // Create a Uint8Array from array buffer
            const uint8Array = new Uint8Array(arrayBuffer);
            // Add file to zip
            newZip.file(fileName, uint8Array, { binary: true });
        })
        .catch(error => {
            console.error("Error loading file ${fileName}: ${error}");
            document.getElementById("info").innerHTML += '<b class="red">Error loading file ' + fileName + ' : ' + error + '<b><br>';
        });
});

            // making module.prop
            const customFile = {
                'module.prop': 'id=MGM \nname=MGM '+ ogZipTitleStripped +' Modified by MagiskGApps \nversion=v0.1 \nversionCode=17 \nauthor=Wacko1805 \ndescription=MagiskGApps modified version of '+ ogZipTitleStripped +' @ MagiskGApps.com/maker',
            };
            Object.keys(customFile).forEach(fileName => {
                const fileContent = customFile[fileName];
                newZip.file(fileName, fileContent, { binary: true });
            });


            Promise.all(promises).then(function() {
                console.log('All files extracted. Creating new zip file...');
                document.getElementById("info").innerHTML += '<h3>All files extracted. Creating new zip file...<br>This may take up to 5 minutes depending on the GApps package size, browser and device.<h3><br>';
                newZip.generateAsync({type:'blob'}).then(function(blob) {
                    console.log('New zip file created. Downloading...');
                    document.getElementById("info").innerHTML += 'New zip file created. Downloading...<br>';
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'MagiskGAppsMaker converted - '+ ogZipTitle +'.zip';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    console.log('Download complete.');
                    document.getElementById("info").innerHTML += 'Zip file made. File should download shortly!<br>';
                });
            });
        });
    };
    reader.readAsArrayBuffer(file);
})