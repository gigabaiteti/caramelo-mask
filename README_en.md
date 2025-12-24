# 🐶 Caramelo Mask

Disponível em Português [README.md](README.md) e em Inglês [README_en.md](README_en.md)

**Caramelo Mask** is a lightweight, dependency-free (Vanilla JS) input mask plugin, inspired by the classic jQuery Mask Plugin. It was designed to be modern, easy to use, and support dynamic Brazilian masks (like CPF/CNPJ and 8/9-digit Phone Numbers) natively.

## 🚀 Features

- **Zero Dependencies**: Works with native JavaScript, no jQuery required.
- **Static Masks**: Dates, times, ZIP codes, license plates, etc.
- **Special Dynamic Masks**: 
  - `CPF_CNPJ`: Automatically switches between CPF and CNPJ (supporting the new alphanumeric CNPJ format).
  - `CELULAR_TELEFONE`: Automatically switches between landline (8 digits) and mobile (9 digits).
- **Reverse Mask**: Ideal for currency fields.
- **Easy to Use**: Configure everything via `data-mask` HTML attributes or programmatically via JS.

## 📦 Installation

Simply download the `caramelo.mask.js` file and include it in your project:

```html
<script src="path/to/caramelo.mask.js"></script>
```

## 🛠 Usage

### Via HTML (data-* Attributes)

The simplest way is to add the `data-mask` attribute to your inputs. The plugin initializes automatically when the document loads.

#### Common Masks
```html
<!-- Date -->
<input type="text" data-mask="00/00/0000" placeholder="DD/MM/YYYY">

<!-- Time -->
<input type="text" data-mask="00:00:00" placeholder="HH:MM:SS">

<!-- Date & Time -->
<input type="text" data-mask="00/00/0000 00:00:00" placeholder="DD/MM/YYYY HH:MM:SS">

<!-- License Plate -->
<input type="text" data-mask="AAA 0000" placeholder="AAA 0000">

<!-- Landline Phone -->
<input type="text" data-mask="(00) 0000-0000" placeholder="(00) 0000-0000">

<!-- Mobile Phone -->
<input type="text" data-mask="(00) 00000-0000" placeholder="(00) 00000-0000">

<!-- ZIP Code (CEP) -->
<input type="text" data-mask="00000-000" placeholder="00000-000">

<!-- Money (Reverse) -->
<input type="text" data-mask="#.##0,00" data-mask-reverse="true" placeholder="0,00">
```

#### Dynamic Masks (Special)
Use reserved keywords to activate smart masks:

```html
<!-- CPF or CNPJ (automatic) -->
<input type="text" data-mask="CPF_CNPJ" placeholder="CPF or CNPJ">

<!-- Mobile or Landline (automatic) -->
<input type="text" data-mask="CELULAR_TELEFONE" placeholder="(00) 00000-0000">
```

> **Note**: The `CPF_CNPJ` mask supports the modern alphanumeric CNPJ format (letters and numbers).

### Via JavaScript

You can also initialize or control masks via code:

```javascript
// Select the element
const input = document.querySelector('#my-input');

// Initialize the mask
const mask = new CarameloMask(input, '00/00/0000', {
    onComplete: function(val) {
        console.log('Mask completed:', val);
    },
    onChange: function(val) {
        console.log('Value changed:', val);
    }
});

// Remove mask
mask.unmask();

// Get clean value (without formatting)
console.log(mask.getCleanVal());
```

---

## 📝 Mask Patterns

| Character | Description |
|-----------|-----------|
| `0`       | Numbers Only |
| `9`       | Numbers Only (Optional) |
| `#`       | Numbers Only (Recursive - e.g., money) |
| `A`       | Alphanumeric (Letters and Numbers) |
| `S`       | Letters Only |

## 📄 License

Distributed under the **MIT** license. See the `LICENSE` file for more details.

---
*Developed with ❤️ and clean code.*
