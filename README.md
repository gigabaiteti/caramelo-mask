# 🐶 Caramelo Mask

Available in English [README_en.md](README_en.md)

**Caramelo Mask** é um plugin de máscaras input leve, sem dependências (Vanilla JS), inspirado no clássico jQuery Mask Plugin. Ele foi projetado para ser moderno, fácil de usar e suportar máscaras dinâmicas brasileiras (como CPF/CNPJ e Telefone de 8/9 dígitos) nativamente.

## 🚀 Funcionalidades

- **Zero Dependências**: Funciona com JavaScript nativo, sem necessidade de jQuery.
- **Máscaras Estáticas**: Datas, horas, CEP, placas, etc.
- **Máscaras Dinâmicas Especiais**: 
  - `CPF_CNPJ`: Alterna automaticamente entre CPF e CNPJ (com suporte ao novo formato de CNPJ alfanumérico).
  - `CELULAR_TELEFONE`: Alterna automaticamente entre fixo (8 dígitos) e celular (9 dígitos).
- **Máscara Reversa**: Ideal para campos monetários.
- **Fácil uso**: Configure tudo via atributos HTML `data-mask` ou programaticamente via JS.

## 📦 Instalação

Basta baixar o arquivo `caramelo.mask.js` e incluí-lo no seu projeto:

```html
<script src="path/to/caramelo.mask.js"></script>
```

## 🛠 Como usar

### Via HTML (Atributos data-*)

A forma mais simples é adicionar o atributo `data-mask` aos seus inputs. O plugin inicializa automaticamente quando o documento é carregado.

#### Máscaras Comuns
```html
<!-- Data -->
<input type="text" data-mask="00/00/0000" placeholder="DD/MM/AAAA">

<!-- Hora -->
<input type="text" data-mask="00:00:00" placeholder="HH:MM:SS">

<!-- Data e Hora -->
<input type="text" data-mask="00/00/0000 00:00:00" placeholder="DD/MM/AAAA HH:MM:SS">

<!-- Placa -->
<input type="text" data-mask="AAA 0000" placeholder="AAA 0000">

<!-- Telefone Fixo -->
<input type="text" data-mask="(00) 0000-0000" placeholder="(00) 0000-0000">

<!-- Telefone Celular -->
<input type="text" data-mask="(00) 00000-0000" placeholder="(00) 00000-0000">

<!-- CEP -->
<input type="text" data-mask="00000-000" placeholder="00000-000">

<!-- Dinheiro (Reverso) -->
<input type="text" data-mask="#.##0,00" data-mask-reverse="true" placeholder="0,00">
```

#### Máscaras Dinâmicas (Especiais)
Use as palavras-chave reservadas para ativar as máscaras inteligentes:

```html
<!-- CPF ou CNPJ (automático) -->
<input type="text" data-mask="CPF_CNPJ" placeholder="CPF ou CNPJ">

<!-- Celular ou Fixo (automático) -->
<input type="text" data-mask="CELULAR_TELEFONE" placeholder="(00) 00000-0000">
```

> **Nota**: A máscara `CPF_CNPJ` suporta o formato alfanumérico moderno de CNPJ (letras e números).

### Via JavaScript

Você também pode inicializar ou controlar máscaras via código:

```javascript
// Seleciona o elemento
const input = document.querySelector('#meu-input');

// Inicializa a máscara
const mask = new CarameloMask(input, '00/00/0000', {
    onComplete: function(val) {
        console.log('Máscara completa:', val);
    },
    onChange: function(val) {
        console.log('Valor alterado:', val);
    }
});

// Remover máscara
mask.unmask();

// Obter valor limpo (sem formatação)
console.log(mask.getCleanVal());
```

---

## 📝 Padrões de Máscara

| Caractere | Descrição |
|-----------|-----------|
| `0`       | Apenas Números |
| `9`       | Apenas Números (Opcional) |
| `#`       | Apenas Números (Recursivo - ex: dinheiro) |
| `A`       | Alfanumérico (Letras e Números) |
| `S`       | Apenas Letras |

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---
*Desenvolvido com ❤️ e código limpo.*
