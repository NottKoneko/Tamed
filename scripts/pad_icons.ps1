Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Code Projects\PetOwner Site\public\logo-icon.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source logo icon not found at $srcPath"
    exit 1
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)
$srcWidth = $srcImage.Width
$srcHeight = $srcImage.Height

# Target canvas size
$canvasSize = 512
# Icon maximum target size inside canvas (~72% of 512 = 368px)
$maxSize = 368

# Calculate scale to fit within maxSize preserving aspect ratio
$scale = [Math]::Min($maxSize / $srcWidth, $maxSize / $srcHeight)
$destWidth = [int]($srcWidth * $scale)
$destHeight = [int]($srcHeight * $scale)

# Calculate centered offsets
$destX = [int](($canvasSize - $destWidth) / 2)
$destY = [int](($canvasSize - $destHeight) / 2)

# Create 512x512 transparent bitmap
$bmp = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)

# High Quality Rendering settings
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.DrawImage($srcImage, $destX, $destY, $destWidth, $destHeight)

# Output paths
$paths = @(
    "c:\Code Projects\PetOwner Site\public\favicon.png",
    "c:\Code Projects\PetOwner Site\public\apple-touch-icon.png",
    "c:\Code Projects\PetOwner Site\public\icon-192.png",
    "c:\Code Projects\PetOwner Site\public\icon-512.png"
)

foreach ($path in $paths) {
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Saved padded icon: $path"
}

$graphics.Dispose()
$bmp.Dispose()
$srcImage.Dispose()
Write-Host "Icon padding generation complete!"
