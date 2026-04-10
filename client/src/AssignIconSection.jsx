import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  Checkbox,
} from '@mui/material';

const ICON_RENDER_BATCH = 180;
const SEARCH_DEBOUNCE_MS = 180;

export default function AssignIconSection({
  skills,
  settingsTarget,
  setSettingsTarget,
  settingsIconPkg,
  setSettingsIconPkg,
  settingsIconName,
  setSettingsIconName,
  enabledPackagesList,
  onApply,
  fixedTarget,
  showApplyToSubSkills = false,
}) {
  const [iconSearch, setIconSearch] = useState('');
  const [applyToSubSkills, setApplyToSubSkills] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(ICON_RENDER_BATCH);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(iconSearch);
      setVisibleCount(ICON_RENDER_BATCH);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [iconSearch]);
  useEffect(() => {
    setVisibleCount(ICON_RENDER_BATCH);
  }, [settingsIconPkg]);

  const pkg = enabledPackagesList.find((p) => p.id === settingsIconPkg);
  const allIconNames = useMemo(() => {
    const p = enabledPackagesList.find((x) => x.id === settingsIconPkg);
    if (!p) return [];
    try {
      return p.getIconNames();
    } catch (_) {
      return [];
    }
  }, [enabledPackagesList, settingsIconPkg]);
  const filteredIconNames = useMemo(() => {
    const q = (debouncedSearch || '').toLowerCase().trim();
    if (!q) return allIconNames;
    return allIconNames.filter((name) => name.toLowerCase().includes(q));
  }, [allIconNames, debouncedSearch]);
  const visibleIconNames = useMemo(
    () => filteredIconNames.slice(0, visibleCount),
    [filteredIconNames, visibleCount]
  );
  const hasMore = filteredIconNames.length > visibleCount;
  const remaining = filteredIconNames.length - visibleCount;

  const effectiveTarget = fixedTarget != null ? fixedTarget : settingsTarget;

  return (
    <>
      {!fixedTarget && (
        <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>Assign icon to skill / sub-skill</Typography>
      )}
      {fixedTarget == null && (
        <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2 }}>
          <InputLabel id="settings-target-label">Set icon for</InputLabel>
          <Select
            labelId="settings-target-label"
            label="Set icon for"
            value={settingsTarget}
            onChange={(e) => setSettingsTarget(e.target.value)}
          >
            {skills.map((skill) => {
              const subSkills = skill.subSkills || [];
              if (subSkills.length === 0) {
                return (
                  <MenuItem key={`skill:${skill.name}`} value={`skill:${skill.name}`}>
                    Skill: {skill.name}
                  </MenuItem>
                );
              }
              return [
                <MenuItem key={`skill:${skill.name}`} value={`skill:${skill.name}`}>
                  Skill: {skill.name}
                </MenuItem>,
                ...subSkills.map((s) => (
                  <MenuItem key={`subSkill:${skill.name}:${s}`} value={`subSkill:${skill.name}:${s}`}>
                    {skill.name} &gt; {s}
                  </MenuItem>
                )),
              ];
            })}
          </Select>
        </FormControl>
      )}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="settings-pkg-label">Icon package</InputLabel>
        <Select
          labelId="settings-pkg-label"
          label="Icon package"
          value={settingsIconPkg}
          onChange={(e) => {
            setSettingsIconPkg(e.target.value);
            setSettingsIconName('');
            setIconSearch('');
          }}
        >
          {enabledPackagesList.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="subtitle2" sx={{ mb: 1 }}>Icon</Typography>
      <TextField
        size="small"
        placeholder="Search by icon name..."
        value={iconSearch}
        onChange={(e) => setIconSearch(e.target.value)}
        sx={{ mb: 1.5, width: '100%', maxWidth: 320 }}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
          gap: 0.5,
          maxHeight: 360,
          overflow: 'auto',
          p: 1,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      >
        {visibleIconNames.map((name) => {
          const IconC = pkg?.getIcon(name);
          const isCombined = settingsIconPkg === '__all__';
          const selected = !isCombined && settingsIconName === name;
          const handleSelect = () => {
            if (settingsIconPkg === '__all__') {
              const idx = name.indexOf(':');
              if (idx > 0) {
                setSettingsIconPkg(name.slice(0, idx));
                setSettingsIconName(name.slice(idx + 1));
              } else {
                setSettingsIconName(name);
              }
            } else {
              setSettingsIconName(name);
            }
          };
          const cell = (
            <Box
              onClick={handleSelect}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
                minHeight: 64,
                borderRadius: 1,
                cursor: 'pointer',
                border: 2,
                borderColor: selected ? 'primary.main' : 'transparent',
                bgcolor: selected ? 'primary.main' : 'transparent',
                color: selected ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  bgcolor: selected ? 'primary.dark' : 'action.selected',
                },
              }}
            >
              {IconC ? (
                (isCombined && name.includes(':') ? name.slice(0, name.indexOf(':')) : settingsIconPkg) === 'mui' ? (
                  <IconC sx={{ fontSize: 28 }} />
                ) : (
                  React.createElement(IconC, { size: 28 })
                )
              ) : (
                <Box sx={{ width: 28, height: 28, bgcolor: 'divider', borderRadius: 0.5 }} />
              )}
              <Typography variant="caption" noWrap sx={{ mt: 0.25, maxWidth: '100%', fontSize: '0.65rem' }}>
                {isCombined && name.includes(':') ? name.slice(name.indexOf(':') + 1) : name}
              </Typography>
            </Box>
          );
          return (
            <Tooltip key={name} title={name} placement="top">
              {cell}
            </Tooltip>
          );
        })}
      </Box>
      {hasMore && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => setVisibleCount((c) => c + ICON_RENDER_BATCH)}
          sx={{ mt: 1 }}
        >
          Show more ({remaining} remaining)
        </Button>
      )}
      {filteredIconNames.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {allIconNames.length === 0
            ? (settingsIconPkg === '__all__' ? 'No icons from any package.' : 'No icons in this package (or package failed to load). Try "All (combined)" to see other packages.')
            : 'No icons match your search.'}
        </Typography>
      )}
      {settingsIconName && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Selected: {settingsIconName}
        </Typography>
      )}
      {showApplyToSubSkills && (
        <FormControlLabel
          control={
            <Checkbox
              checked={applyToSubSkills}
              onChange={(e) => setApplyToSubSkills(e.target.checked)}
            />
          }
          label="Apply to skill and all sub-skills"
          sx={{ mt: 1, display: 'block' }}
        />
      )}
      <Button
        variant="contained"
        onClick={() => onApply(showApplyToSubSkills ? applyToSubSkills : undefined)}
        disabled={!effectiveTarget || !settingsIconName}
        sx={{ mt: 2 }}
      >
        Apply
      </Button>
    </>
  );
}
