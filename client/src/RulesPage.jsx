import React, { useMemo, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ color: [] }, { background: [] }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'indent',
  'color',
  'background',
  'blockquote',
  'code-block',
  'link',
];

/** Allow only safe hex colors for persisted theme fields. */
export function sanitizeCssColor(s) {
  if (typeof s !== 'string') return '';
  const t = s.trim();
  if (!t) return '';
  if (/^#([0-9A-Fa-f]{6})$/.test(t)) return t.toLowerCase();
  if (/^#([0-9A-Fa-f]{3})$/.test(t)) {
    const r = t[1];
    const g = t[2];
    const b = t[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '';
}

const RULES_THEME_PRESETS = [
  { id: 'default', label: 'Theme default', bg: '', border: '', header: '', body: '' },
  { id: 'galaxy', label: 'Galaxy', bg: '#0d0630', border: '#7c4dff', header: '#e0d4ff', body: '#ede7ff' },
  { id: 'slate', label: 'Slate', bg: '#1e293b', border: '#475569', header: '#94a3b8', body: '#e2e8f0' },
  { id: 'ocean', label: 'Ocean', bg: '#0a1929', border: '#1565c0', header: '#90caf9', body: '#e3f2fd' },
  { id: 'forest', label: 'Forest', bg: '#0d2818', border: '#2e7d32', header: '#a5d6a7', body: '#e8f5e9' },
  { id: 'parchment', label: 'Parchment', bg: '#fff8e7', border: '#d4a574', header: '#5d4037', body: '#3e2723' },
];

export function normalizeRulesPage(raw) {
  if (!raw || typeof raw !== 'object') return { containers: [] };
  const containers = Array.isArray(raw.containers)
    ? raw.containers
        .map((c, i) => ({
          id:
            typeof c?.id === 'string' && c.id
              ? c.id
              : `rules_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
          title: typeof c?.title === 'string' ? c.title : '',
          html: typeof c?.html === 'string' ? c.html : '',
          bgColor: sanitizeCssColor(c?.bgColor),
          borderColor: sanitizeCssColor(c?.borderColor),
          headerTextColor: sanitizeCssColor(c?.headerTextColor),
          contentTextColor: sanitizeCssColor(c?.contentTextColor),
        }))
        .filter((c) => c.id)
    : [];
  return { containers };
}

function sanitizeHtml(html) {
  if (typeof html !== 'string' || !html.trim()) return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
}

export default function RulesPage({ rulesPage, onChange, readOnly }) {
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftHtml, setDraftHtml] = useState('');
  const [draftBgColor, setDraftBgColor] = useState('');
  const [draftBorderColor, setDraftBorderColor] = useState('');
  const [draftHeaderTextColor, setDraftHeaderTextColor] = useState('');
  const [draftContentTextColor, setDraftContentTextColor] = useState('');

  const containers = normalizeRulesPage(rulesPage).containers;

  const beginEdit = useCallback((c) => {
    setEditingId(c.id);
    setDraftTitle(c.title || '');
    setDraftHtml(c.html || '');
    setDraftBgColor(c.bgColor || '');
    setDraftBorderColor(c.borderColor || '');
    setDraftHeaderTextColor(c.headerTextColor || '');
    setDraftContentTextColor(c.contentTextColor || '');
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setDraftTitle('');
    setDraftHtml('');
    setDraftBgColor('');
    setDraftBorderColor('');
    setDraftHeaderTextColor('');
    setDraftContentTextColor('');
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingId) return;
    const list = normalizeRulesPage(rulesPage).containers;
    const next = list.map((c) =>
      c.id === editingId
        ? {
            ...c,
            title: draftTitle.trim(),
            html: draftHtml,
            bgColor: sanitizeCssColor(draftBgColor),
            borderColor: sanitizeCssColor(draftBorderColor),
            headerTextColor: sanitizeCssColor(draftHeaderTextColor),
            contentTextColor: sanitizeCssColor(draftContentTextColor),
          }
        : c,
    );
    onChange({ containers: next });
    cancelEdit();
  }, [
    editingId,
    draftTitle,
    draftHtml,
    draftBgColor,
    draftBorderColor,
    draftHeaderTextColor,
    draftContentTextColor,
    rulesPage,
    onChange,
    cancelEdit,
  ]);

  const addContainer = useCallback(() => {
    const id = `rules_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const list = normalizeRulesPage(rulesPage).containers;
    onChange({
      containers: [...list, { id, title: 'New section', html: '<p><br></p>' }],
    });
    setEditingId(id);
    setDraftTitle('New section');
    setDraftHtml('<p><br></p>');
    setDraftBgColor('');
    setDraftBorderColor('');
    setDraftHeaderTextColor('');
    setDraftContentTextColor('');
  }, [rulesPage, onChange]);

  const removeContainer = useCallback(
    (id) => {
      if (!window.confirm('Remove this section?')) return;
      if (editingId === id) cancelEdit();
      const list = normalizeRulesPage(rulesPage).containers;
      onChange({ containers: list.filter((c) => c.id !== id) });
    },
    [rulesPage, onChange, editingId, cancelEdit],
  );

  const applyPreset = useCallback((presetId) => {
    const p = RULES_THEME_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setDraftBgColor(p.bg);
    setDraftBorderColor(p.border);
    setDraftHeaderTextColor(p.header);
    setDraftContentTextColor(p.body);
  }, []);

  const modules = useMemo(() => QUILL_MODULES, []);

  const colorField = (label, value, setValue) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 1, flex: '1 1 200px' }}>
      <TextField
        label={`${label} (hex)`}
        size="small"
        value={value}
        onChange={(e) => setValue(sanitizeCssColor(e.target.value))}
        placeholder="#000000"
        helperText="Empty = use page theme"
        sx={{ flex: '1 1 140px', minWidth: 120 }}
      />
      <TextField
        label="Pick"
        size="small"
        type="color"
        value={value || '#ffffff'}
        onChange={(e) => setValue(sanitizeCssColor(e.target.value))}
        sx={{ width: 72 }}
        InputLabelProps={{ shrink: true }}
      />
    </Box>
  );

  return (
    <Box sx={{ mt: 3, width: '100%', maxWidth: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Rules
      </Typography>
      {!readOnly && (
        <Button variant="contained" sx={{ mb: 2 }} onClick={addContainer}>
          Add container
        </Button>
      )}
      <Stack spacing={2}>
        {containers.length === 0 && (
          <Typography color="text.secondary">
            {readOnly
              ? 'No rules have been published yet.'
              : 'No sections yet. Click “Add container” to create one.'}
          </Typography>
        )}
        {containers.map((c, idx) => {
          const isEditing = !readOnly && editingId === c.id;
          const safeView = sanitizeHtml(c.html);
          const headerColor = (isEditing ? draftHeaderTextColor : c.headerTextColor) || 'text.secondary';
          const cardBg = isEditing ? draftBgColor || c.bgColor || '' : c.bgColor || '';
          const cardBorder = isEditing ? draftBorderColor || c.borderColor || '' : c.borderColor || '';
          const bodyTextColor = isEditing ? draftContentTextColor || c.contentTextColor : c.contentTextColor;
          return (
            <Card
              key={c.id}
              variant="outlined"
              sx={{
                overflow: 'visible',
                border: 1,
                borderColor: cardBorder || 'divider',
                bgcolor: cardBg || 'background.paper',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    mb: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: headerColor,
                    }}
                  >
                    Section {idx + 1}
                    {c.title ? ` · ${c.title}` : ''}
                  </Typography>
                  {!readOnly && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {!isEditing ? (
                        <>
                          <IconButton
                            size="small"
                            aria-label="Edit section"
                            onClick={() => beginEdit(c)}
                            sx={{ color: c.headerTextColor || 'text.secondary' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            aria-label="Delete section"
                            color="error"
                            onClick={() => removeContainer(c.id)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : null}
                    </Box>
                  )}
                </Box>

                {isEditing ? (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                      Quick themes
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {RULES_THEME_PRESETS.map((p) => (
                        <Button key={p.id} size="small" variant="outlined" onClick={() => applyPreset(p.id)}>
                          {p.label}
                        </Button>
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Container colors (optional). Section label row uses “Header text”; body default uses “Body
                      text”. Use the editor toolbar for H1–H3, lists, and per-word colors.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      {colorField('Background', draftBgColor, setDraftBgColor)}
                      {colorField('Border', draftBorderColor, setDraftBorderColor)}
                      {colorField('Header text', draftHeaderTextColor, setDraftHeaderTextColor)}
                      {colorField('Body text (default)', draftContentTextColor, setDraftContentTextColor)}
                    </Box>
                    <TextField
                      label="Section title"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Content (rich text: headings, bold, links, per-word colors)
                    </Typography>
                    <Box
                      sx={{
                        '& .ql-container': {
                          minHeight: 180,
                          fontSize: '1rem',
                          borderColor: cardBorder || 'divider',
                          bgcolor: cardBg || 'background.paper',
                        },
                        '& .ql-editor': {
                          minHeight: 160,
                          ...(bodyTextColor && { color: bodyTextColor }),
                        },
                        '& .ql-toolbar': {
                          bgcolor: cardBg || 'background.paper',
                          borderColor: cardBorder || 'divider',
                        },
                        bgcolor: cardBg || 'background.paper',
                        borderRadius: 1,
                      }}
                    >
                      <ReactQuill
                        key={editingId}
                        theme="snow"
                        value={draftHtml}
                        onChange={setDraftHtml}
                        modules={modules}
                        formats={QUILL_FORMATS}
                      />
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button variant="contained" onClick={saveEdit}>
                        Save section
                      </Button>
                      <Button variant="outlined" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    className="rules-html-view"
                    sx={{
                      color: c.contentTextColor || undefined,
                      '& p': { mb: 1 },
                      '& ul, & ol': { pl: 2, mb: 1 },
                      '& h1, & h2, & h3': {
                        color: c.contentTextColor || undefined,
                        mt: 1,
                        mb: 0.5,
                      },
                      '& a': { color: 'primary.main' },
                      '& blockquote': {
                        borderLeft: 3,
                        borderColor: 'divider',
                        pl: 1.5,
                        my: 1,
                        opacity: 0.95,
                      },
                    }}
                    dangerouslySetInnerHTML={{ __html: safeView || '<p><em>Empty section</em></p>' }}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
