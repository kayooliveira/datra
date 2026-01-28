package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"strings"
)

//go:embed frontend/src/translations/*.json
var translationsFS embed.FS

type TranslationData map[string]interface{}

var translationCache = make(map[string]TranslationData)

func getTranslations(lang string) TranslationData {
	lang = strings.ToLower(lang)
	if t, ok := translationCache[lang]; ok {
		return t
	}

	data, err := translationsFS.ReadFile(fmt.Sprintf("frontend/src/translations/%s.json", lang))
	if err != nil {
		if lang != "en" {
			return getTranslations("en")
		}
		return nil
	}

	var t TranslationData
	if err := json.Unmarshal(data, &t); err != nil {
		fmt.Printf("Error unmarshaling translations for %s: %v\n", lang, err)
		return nil
	}

	translationCache[lang] = t
	return t
}

func T(lang string, key string) string {
	t := getTranslations(lang)
	if t == nil {
		if lang != "en" {
			return T("en", key)
		}
		return key
	}

	keys := strings.Split(key, ".")
	var current interface{} = t

	for _, k := range keys {
		if m, ok := current.(TranslationData); ok {
			current = m[k]
		} else if m, ok := current.(map[string]interface{}); ok {
			current = m[k]
		} else {
			current = nil
			break
		}
	}

	if val, ok := current.(string); ok && val != "" {
		return val
	}

	if lang != "en" {
		return T("en", key)
	}

	return key
}
