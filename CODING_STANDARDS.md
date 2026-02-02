# Coding Standards - Datra

## Internacionalização (i18n)

### ⚠️ REGRA OBRIGATÓRIA: TODO TEXTO VISÍVEL DEVE USAR i18n

**NUNCA use textos hardcoded em componentes!**

### ❌ ERRADO:
```tsx
<span>Loading...</span>
<button>Save</button>
<div>Error loading data</div>
```

### ✅ CORRETO:
```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <span>{t("app.loading")}</span>
      <button>{t("app.common.save")}</button>
      <div>{t("app.common.error_loading_data")}</div>
    </>
  );
};
```

## Como adicionar novas traduções

### 1. Adicione a chave em ambos os arquivos de tradução:

**frontend/src/translations/en.json:**
```json
{
  "app": {
    "common": {
      "your_key": "Your text in English"
    }
  }
}
```

**frontend/src/translations/pt.json:**
```json
{
  "app": {
    "common": {
      "your_key": "Seu texto em Português"
    }
  }
}
```

### 2. Use no componente:

```tsx
{t("app.common.your_key")}
```

## Organização das chaves de tradução

- `app.loading` - Loading genérico
- `app.common.*` - Textos comuns (error, save, cancel, delete, etc)
- `app.sidebar.*` - Textos da sidebar
- `app.connections.*` - Textos relacionados a conexões
- `app.editor.*` - Textos do editor SQL
- `app.overview.*` - Textos da overview
- `app.history.*` - Textos do histórico

## Exceções permitidas

As únicas exceções para não usar i18n são:

1. **Console logs** - `console.log()`, `console.error()`
2. **Comentários de código** - `// comentários`
3. **Nomes de variáveis** - `const userName = ...`
4. **Placeholders técnicos** - `••••••••` (senhas mascaradas)
5. **IDs técnicos** - `id="some-id"`

## Checklist antes de commit

- [ ] Todos os textos visíveis usam `t()` do i18n
- [ ] Chaves adicionadas em `en.json` E `pt.json`
- [ ] Traduções fazem sentido em ambos os idiomas
- [ ] `useTranslation()` está importado quando necessário
- [ ] Nenhum texto hardcoded em JSX/TSX

## Ferramentas

Para encontrar textos hardcoded:
```bash
grep -r ">\s*[A-Z][a-z]" frontend/src --include="*.tsx"
```

## Exemplo completo

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

export const MyComponent: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div>
      <h1>{t("app.my_component.title")}</h1>
      <p>{t("app.my_component.description")}</p>
      
      {isLoading ? (
        <span>{t("app.loading")}</span>
      ) : (
        <button onClick={handleSave}>
          {t("app.common.save")}
        </button>
      )}
      
      {error && (
        <div className="error">
          {t("app.common.error")}: {error.message}
        </div>
      )}
    </div>
  );
};
```

---

**Lembre-se:** Datra é uma aplicação internacional. Sempre pense em como seu texto será traduzido!
