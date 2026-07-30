$files = @(
    "public/assets/cryptomap-mobile-performance.png",
    "public/assets/nailhub-search-flow.png",
    "public/assets/nailhub-thumbnail-v2.png",
    "public/assets/nailhub-thumbnail.png",
    "public/assets/nexora-logo.png",
    "public/assets/nexora-thumbnail-v2.png",
    "public/assets/nexora-thumbnail.png",
    "public/assets/nexora-touch-visual.png",
    "public/images/case-study/agent_rules.jpg",
    "public/images/case-study/ai_process_cs_2.jpg",
    "public/images/case-study/bg_1.png", "public/images/case-study/bg_2.png", "public/images/case-study/bg_3.png", "public/images/case-study/bg_4.png",
    "public/images/case-study/cryptomap_hero.png", "public/images/case-study/cryptomap_light_map.png", "public/images/case-study/cryptomap_logo.png", "public/images/case-study/cryptomap_map.png",
    "public/images/case-study/cryptomap_map_1782502386218.png", "public/images/case-study/cryptomap_market_1782502396589.png",
    "public/images/case-study/cryptomap_painpoints_1782502377473.png", "public/images/case-study/cryptomap_performance_1782502407448.png",
    "public/images/case-study/cryptomap_vlinkpay_ecosystem.png",
    "public/images/case-study/cyberpunk_designer_room_1782492169164.png",
    "public/images/case-study/data_core.jpg",
    "public/images/case-study/fintech_cs_1.jpg", "public/images/case-study/fintech_cs_3.jpg",
    "public/images/case-study/handoff_cs_2.jpg",
    "public/images/case-study/nailhub_hero.png",
    "public/images/case-study/nexora_ui_touch.png",
    "public/images/case-study/research_1.png", "public/images/case-study/research_2.png", "public/images/case-study/research_3.png", "public/images/case-study/research_4.png",
    "public/images/case-study/workspace_bg_light_1782495766265.png",
    "public/images/case-study/wow_cosmic_navbar_1782497354049.png",
    "public/cantho-eye-level.png",
    "public/cantho-landscape.png",
    "public/favicon.svg",
    "public/hero-bg.jpg",
    "public/icons.svg",
    "public/workspace-day.png",
    "public/workspace-green.png",
    "public/workspace-night.png"
)

$deletedCount = 0
$spaceFreed = 0

foreach ($f in $files) {
    if (Test-Path $f) {
        $size = (Get-Item $f).Length
        $spaceFreed += $size
        Remove-Item $f -Force
        $deletedCount++
    }
}

if (Test-Path "public/images/case-study") {
    $mediaFiles = Get-ChildItem -Path public/images/case-study/media__*.png
    if ($mediaFiles) {
        foreach ($f in $mediaFiles) {
            $size = $f.Length
            $spaceFreed += $size
            Remove-Item $f.FullName -Force
            $deletedCount++
        }
    }
}

Write-Host "Total deleted: $deletedCount"
Write-Host "Space freed: $spaceFreed bytes"
