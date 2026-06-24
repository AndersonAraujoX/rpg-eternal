#!/usr/bin/env perl
use strict;
use warnings;

my $project = "/home/anderson/Documents/projeto/eternal-rpg/rpg-eternal";

# ─── Fix useGame.ts ───────────────────────────────────────────────────────────
{
    my $file = "$project/src/hooks/useGame.ts";
    local $/;
    open my $fh, '<', $file or die "Cannot open $file: $!";
    my $content = <$fh>;
    close $fh;

    my $changes = 0;

    # Fix 1: Add isWorldBossModalActive as 3rd parameter
    if ($content =~ s{
        (export\s+const\s+useGame\s+=\s+\(\s*\n
        \s+industryInventory\?:\s+Record<string,\s*number>,\s*\n
        \s+setIndustryState\?:\s+React\.Dispatch<React\.SetStateAction<IndustryState>>)\s*\n
        (\)\s+=>\s+\{)
    }{$1,\n    isWorldBossModalActive?: boolean\n$2}x) {
        print "  [OK] Added isWorldBossModalActive parameter\n";
        $changes++;
    } else {
        print "  [SKIP] isWorldBossModalActive parameter (already applied or pattern not found)\n";
    }

    # Fix 2: Add mechanizedCardsFused to usePersistence call
    if ($content =~ s{
        (unlockedRiftPerks,\s*\n\s+setUnlockedRiftPerks)\s*\n(\s+\}\);)
    }{$1,\n        mechanizedCardsFused,\n        setMechanizedCardsFused\n$2}x) {
        print "  [OK] Added mechanizedCardsFused to usePersistence\n";
        $changes++;
    } else {
        print "  [SKIP] mechanizedCardsFused in usePersistence (already applied or pattern not found)\n";
    }

    if ($changes > 0) {
        open my $out, '>', $file or die "Cannot write $file: $!";
        print $out $content;
        close $out;
        print "  Saved $file ($changes changes)\n";
    }
}

# ─── Fix App.tsx ──────────────────────────────────────────────────────────────
{
    my $file = "$project/src/App.tsx";
    local $/;
    open my $fh, '<', $file or die "Cannot open $file: $!";
    my $content = <$fh>;
    close $fh;

    my $changes = 0;

    # Fix 3: Move showWorldBoss before useGame
    # First, add it after useIndustry if not already there
    if ($content !~ /showWorldBoss.*must be before useGame/) {
        if ($content =~ s{
            (const\s+industry\s+=\s+useIndustry\(\);\s*\n)(\s+const\s+\{)
        }{$1  const [showWorldBoss, setShowWorldBoss] = useState(false); // Phase 6 — must be before useGame\n$2}x) {
            print "  [OK] Added showWorldBoss before useGame\n";
            $changes++;
        }
        # Remove old declaration
        if ($content =~ s{\s*const \[showWorldBoss, setShowWorldBoss\] = useState\(false\); // Phase 6\n}{}) {
            print "  [OK] Removed old showWorldBoss declaration\n";
            $changes++;
        }
    } else {
        print "  [SKIP] showWorldBoss move (already applied)\n";
    }

    # Fix 4: Add voidOvergrowthActive to destructuring
    if ($content !~ /voidOvergrowthActive\s*\n\s*\}\s*=\s*useGame/) {
        if ($content =~ s{
            (mechanizedCardsFused,\s+fuseMechanizedCards)\s*\n(\s+\}\s+=\s+useGame)
        }{$1,\n    voidOvergrowthActive\n$2}x) {
            print "  [OK] Added voidOvergrowthActive to destructuring\n";
            $changes++;
        }
    } else {
        print "  [SKIP] voidOvergrowthActive (already applied)\n";
    }

    if ($changes > 0) {
        open my $out, '>', $file or die "Cannot write $file: $!";
        print $out $content;
        close $out;
        print "  Saved $file ($changes changes)\n";
    }
}

# ─── Fix types.ts ─────────────────────────────────────────────────────────────
{
    my $file = "$project/src/engine/types.ts";
    local $/;
    open my $fh, '<', $file or die "Cannot open $file: $!";
    my $content = <$fh>;
    close $fh;

    my $changes = 0;

    # Fix 5: Add fuseMechanizedCards to GameActions
    if ($content !~ /fuseMechanizedCards/) {
        if ($content =~ s{
            (sellOre:\s+\(oreType:\s+'copper'\s+\|\s+'iron',\s+amount:\s+number\)\s+=>\s+void;\s*\n)(\})
        }{$1    fuseMechanizedCards: () => void;\n$2}x) {
            print "  [OK] Added fuseMechanizedCards to GameActions\n";
            $changes++;
        }
    } else {
        print "  [SKIP] fuseMechanizedCards in GameActions (already applied)\n";
    }

    if ($changes > 0) {
        open my $out, '>', $file or die "Cannot write $file: $!";
        print $out $content;
        close $out;
        print "  Saved $file ($changes changes)\n";
    }
}

print "\n=== All fixes processed! ===\n";
