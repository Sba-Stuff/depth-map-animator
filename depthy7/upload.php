<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // Check if files are uploaded
  if (isset($_FILES['realImage']) && isset($_FILES['depthMap'])) {
    // Define target directory for uploads
    $targetDir = "uploads/";

    // Create the directory if it doesn't exist
    if (!file_exists($targetDir)) {
      mkdir($targetDir, 0777, true);
    }

    // Handle the real image (jpg)
    $realImage = $_FILES['realImage'];
    $realImageTmp = $realImage['tmp_name'];
    $realImageName = "demo.jpg"; // Renaming to demo.jpg
    $realImagePath = $targetDir . $realImageName;

    // Handle the depth map (png)
    $depthMap = $_FILES['depthMap'];
    $depthMapTmp = $depthMap['tmp_name'];
    $depthMapName = "demo-depthmap.png"; // Renaming to demo-depthmap.png
    $depthMapPath = $targetDir . $depthMapName;

    // Check for valid file types
    $allowedImageTypes = ['image/jpeg', 'image/png'];
    if (in_array($realImage['type'], $allowedImageTypes) && in_array($depthMap['type'], $allowedImageTypes)) {
      
      // Move the files to the target directory
      if (move_uploaded_file($realImageTmp, $realImagePath) && move_uploaded_file($depthMapTmp, $depthMapPath)) {
        
        // Redirect to output page after successful upload
        header("Location: output.html");
        exit();
      } else {
        echo "Sorry, there was an error uploading your files.";
      }
    } else {
      echo "Invalid file type. Only JPG and PNG are allowed.";
    }
  } else {
    echo "Please upload both files.";
  }
} else {
  echo "Invalid request method.";
}
?>
