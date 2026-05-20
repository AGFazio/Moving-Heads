$OutputDir  = "C:\Users\agfaz\Dropbox\xLights\2025\MH Adv Importing\New Head Imports"
$HeadCounts = @(1, 2, 4, 6, 8)

$CwColors = @("#ffffff","#ff0000","#ffff00","#0000ff","#00ff00","#e1fdff","#cc3232","#00ffff","#ff00ff","#ffff80","#ff80c0","#0000d0","#c0c0c0")
$CwDmx    = @(2,9,17,25,33,41,49,57,65,73,81,90,105)

function Find-Ch($channels, $name) {
    for ($i = 0; $i -lt $channels.Count; $i++) {
        if ($channels[$i] -eq $name) { return $i + 1 }
    }
    return 0
}

function Build-CwColorAttrs {
    $parts = @()
    for ($i = 0; $i -lt $CwColors.Count; $i++) { $parts += "DmxColorWheelColor$i=`"$($CwColors[$i])`"" }
    return $parts -join " "
}

function Build-CwDmxAttrs {
    $parts = @()
    for ($i = 0; $i -lt $CwDmx.Count; $i++) { $parts += "DmxColorWheelDMX$i=`"$($CwDmx[$i])`"" }
    return $parts -join " "
}

$cwColorAttrs = Build-CwColorAttrs
$cwDmxAttrs   = Build-CwDmxAttrs

function Build-StringRefs($chNum, $n) {
    $parts = @()
    for ($i = 1; $i -le $n; $i++) { $parts += "String$i=`"@MH${i}:$chNum`"" }
    return $parts -join " "
}

function Build-StringModelBase($modelName, $chNum, $yPos, $n) {
    $sr = Build-StringRefs $chNum $n
    return "name=`"$modelName`" DisplayAs=`"Single Line`" Advanced=`"1`" Antialias=`"1`" Controller=`"`" Dir=`"L`" LayoutGroup=`"Default`" LightsPerNode=`"1`" NodesPerString=`"1`" NumStrings=`"$n`" PixelSize=`"10`" SourceVersion=`"2026.09.1`" StartChannel=`"@MH1:$chNum`" StartSide=`"B`" $sr StringType=`"Single Color Intensity`" Transparency=`"0`" versionNumber=`"8`" WorldPosX=`"155.322006`" WorldPosY=`"$yPos`" WorldPosZ=`"0.000000`" X2=`"63.696701`" Y2=`"-0.866577`" Z2=`"0.000000`""
}

function Build-StringModelWithAliases($modelName, $chNum, $yPos, $n, $aliases) {
    $attrs = Build-StringModelBase $modelName $chNum $yPos $n
    $aliasLines = ($aliases | ForEach-Object { "`t`t`t<alias name=`"$_`" />" }) -join "`n"
    return "`t<model $attrs>`n`t`t<Aliases>`n$aliasLines`n`t`t</Aliases>`n`t</model>"
}

function Build-StringModelPlain($modelName, $chNum, $yPos, $n) {
    $attrs = Build-StringModelBase $modelName $chNum $yPos $n
    return "`t<model $attrs />"
}

function Build-HeadModel($idx, $totalCh, $panCh, $panFineCh, $tiltCh, $tiltFineCh,
                         $dimmerCh, $shutterCh, $cwCh, $nodeNames, $panMotor, $tiltMotor) {
    $startCh        = 1 + ($idx - 1) * $totalCh
    $worldX         = [string]::Format("{0:F6}", 265.093201 + ($idx - 1) * 40.0)
    $worldY         = "506.157715"
    $panReverse     = $panMotor.reverse
    $panOrientHome  = $panMotor.orient_home
    $tiltReverse    = $tiltMotor.reverse
    $tiltOrientHome = $tiltMotor.orient_home
    $tiltOrientZero = $tiltMotor.orient_zero
    $panMin         = $panMotor.min_limit
    $panMax         = $panMotor.max_limit
    $panRange       = [string]::Format("{0:F6}", [double]$panMotor.range_of_motion)
    $tiltMin        = $tiltMotor.min_limit
    $tiltMax        = $tiltMotor.max_limit
    $tiltRange      = [string]::Format("{0:F6}", [double]$tiltMotor.range_of_motion)
    return @"
	<model name="MH$idx" DisplayAs="DmxMovingHeadAdv" Antialias="1" Controller="No Controller" Dir="L" DmxBeamLength="20.000000" DmxBeamOrient="0" DmxBeamWidth="4.000000" DmxBeamYOffset="0.000000" DmxChannelCount="$totalCh" DmxColorType="1" DmxColorWheelChannel="$cwCh" $cwColorAttrs DmxColorWheelDelay="0" $cwDmxAttrs DmxDimmerChannel="$dimmerCh" DmxFixture="MH1" DmxShutterChannel="$shutterCh" DmxShutterOnValue="255" DmxShutterOpen="1" LayoutGroup="Default" MhDimmerChannel="$dimmerCh" NodeNames="$nodeNames" PixelSize="2" RotateX="0.000000" RotateY="0.000000" RotateZ="0.000000" ScaleX="1.000000" ScaleY="1.000000" ScaleZ="1.000000" SourceVersion="2026.09.1" StartChannel="$startCh" StartSide="B" StringType="Single Color White" Transparency="0" versionNumber="8" WorldPosX="$worldX" WorldPosY="$worldY" WorldPosZ="0.000000">
		<PanMotor ChannelCoarse="$panCh" ChannelFine="$panFineCh" MinLimit="$panMin" MaxLimit="$panMax" RangeOfMotion="$panRange" OrientZero="0" OrientHome="$panOrientHome" SlewLimit="180.000000" Reverse="$panReverse" UpsideDown="0" />
		<TiltMotor ChannelCoarse="$tiltCh" ChannelFine="$tiltFineCh" MinLimit="$tiltMin" MaxLimit="$tiltMax" RangeOfMotion="$tiltRange" OrientZero="$tiltOrientZero" OrientHome="$tiltOrientHome" SlewLimit="180.000000" Reverse="$tiltReverse" UpsideDown="0" />
		<BaseMesh ObjFile="C:\Program Files\xLights\meshobjects\SimpleMovingHead\MovingHeadBase.obj" MeshOnly="0" Brightness="40.000000" Width="32.090599" Height="9.159451" Depth="25.529499" ScaleX="1.000000" ScaleY="1.000000" ScaleZ="1.000000" RotateX="0.000000" RotateY="0.000000" RotateZ="0.000000" OffsetX="0.000000" OffsetY="-20.000000" OffsetZ="0.000000" />
		<YokeMesh ObjFile="C:\Program Files\xLights\meshobjects\SimpleMovingHead\MovingHeadYoke.obj" MeshOnly="0" Brightness="50.000000" Width="26.763802" Height="19.488209" Depth="15.915359" ScaleX="1.000000" ScaleY="1.000000" ScaleZ="1.000000" RotateX="0.000000" RotateY="90.000000" RotateZ="0.000000" OffsetX="0.000000" OffsetY="-20.000000" OffsetZ="0.000000" />
		<HeadMesh ObjFile="C:\Program Files\xLights\meshobjects\SimpleMovingHead\MovingHead.obj" MeshOnly="0" Brightness="80.000000" Width="22.069799" Height="24.279701" Depth="11.368110" ScaleX="1.000000" ScaleY="1.000000" ScaleZ="1.000000" RotateX="90.000000" RotateY="90.000000" RotateZ="0.000000" OffsetX="0.000000" OffsetY="0.000000" OffsetZ="0.000000" />
	</model>
"@
}

# Load JSON from the same directory as this script
$jsonPath = Join-Path $OutputDir "moving_heads_channel_types.json"
$data = Get-Content $jsonPath -Raw | ConvertFrom-Json

foreach ($mh in $data.moving_heads) {
    $name      = $mh.name
    $channels  = $mh.channels
    $totalCh   = $channels.Count
    $panMotor  = $mh.pan_motor
    $tiltMotor = $mh.tilt_motor

    $panCh     = Find-Ch $channels "Pan"
    $panFineCh = Find-Ch $channels "Pan Fine"
    $tiltCh    = Find-Ch $channels "Tilt"
    $tiltFineCh = Find-Ch $channels "Tilt Fine"
    $dimmerCh  = Find-Ch $channels "Dimming"
    $shutterCh = Find-Ch $channels "Strobe"
    $cwCh      = Find-Ch $channels "Color Wheel"
    $nodeNames = $channels -join ","
    $safeName  = $name -replace '[/\\:]','-'

    foreach ($n in $HeadCounts) {
        $label   = if ($n -eq 1) { "1 head" } else { "$n heads" }
        $subDir  = if ($n -eq 1) { "1 Head" } else { "$n Heads" }
        $destDir = Join-Path $OutputDir "Files\$subDir"
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null

        $lines = [System.Collections.Generic.List[string]]::new()
        $lines.Add('<?xml version="1.0"?>')
        $lines.Add('<models type="exported">')
        $lines.Add((Build-StringModelWithAliases "MH Dimmer"  $dimmerCh  "478.566010" $n @("mh dimmers","intensity","mh intensity")))
        $lines.Add((Build-StringModelPlain       "MH Pan"     $panCh     "517.977295" $n))
        $lines.Add((Build-StringModelWithAliases "MH Shutter" $shutterCh "458.200409" $n @("mh shutters","mh strobe","mh strobes")))
        $lines.Add((Build-StringModelPlain       "MH Tilt"    $tiltCh    "497.631714" $n))

        for ($i = 1; $i -le $n; $i++) {
            $lines.Add((Build-HeadModel $i $totalCh $panCh $panFineCh $tiltCh $tiltFineCh `
                            $dimmerCh $shutterCh $cwCh $nodeNames $panMotor $tiltMotor))
        }
        $lines.Add('</models>')

        $content  = $lines -join "`n"
        $filepath = Join-Path $destDir "$label $safeName.xmodel"
        [System.IO.File]::WriteAllText($filepath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Written: Files\$subDir\$label $safeName.xmodel"
    }
}
Write-Host "Done."
