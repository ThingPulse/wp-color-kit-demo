# Color Kit Assembly Game - WordPress Plugin

An interactive drag-and-drop PCB assembly game for WordPress with Elementor support.

## Features

- 🎮 Interactive drag-and-drop gameplay
- 📱 Fully responsive (desktop, tablet, mobile)
- 🎨 Smooth animations and transitions
- 🔄 Board flip animation after step 7
- ✨ Flickering display-on effect at completion
- 🎯 Ghost component placement hints
- ⚙️ Customizable button URL and text via shortcode

## Installation

### WordPress Plugin Installation

1. **Upload the plugin folder** to `/wp-content/plugins/color-kit-game/`

2. **Ensure the following structure:**
   ```
   wp-content/plugins/color-kit-game/
   ├── color-kit-game.php
   ├── assets/
   │   ├── color-kit-game.css
   │   ├── color-kit-game.js
   │   └── img/
   │       ├── 00_ConenctorBoard.png
   │       ├── 01_FemaleHeaderPins_12P.png
   │       ├── 02_FemaleHeaderPins_16p.png
   │       ├── 03_MaleHeaderPins_12P.png
   │       ├── 04_MaleHeaderPins_16P.png
   │       ├── 05_ePulseFeather.png
   │       ├── 06_PowerSwitch.png
   │       ├── 07_GroveConnector.png
   │       ├── 10_ConnectorBoard.png
   │       ├── 11_Sticker1.png
   │       ├── 12_Sticker2.png
   │       ├── 13_Sticker3.png
   │       ├── 14_Sticker4.png
   │       ├── 15_Display.png
   │       ├── 16_DisplayOn.png
   │       └── pickup/
   │           ├── 01_FemaleHeaderPins_12P.png
   │           ├── 02_FemaleHeaderPins_16p.png
   │           ├── 03_MaleHeaderPins_12P.png
   │           ├── 04_MaleHeaderPins_16P.png
   │           ├── 05_ePulseFeather.png
   │           ├── 06_PowerSwitch.png
   │           ├── 07_GroveConnector.png
   │           ├── 11_Sticker1.png
   │           ├── 12_Sticker2.png
   │           ├── 13_Sticker3.png
   │           ├── 14_Sticker4.png
   │           └── 15_Display.png
   ```

3. **Activate the plugin** in WordPress admin

## Usage

### Basic Shortcode

```
[color_kit_game]
```

### Shortcode with Custom Button URL

```
[color_kit_game button_url="https://yourstore.com/product/color-kit"]
```

### Shortcode with Custom Button Text

```
[color_kit_game button_text="Order Now"]
```

### Full Shortcode Options

```
[color_kit_game button_url="https://yourstore.com/product/color-kit" button_text="Get Your Color Kit"]
```

### Custom Image Path (Optional)

If you want to store images in a different location:

```
[color_kit_game img_path="https://yourcdn.com/images/"]
```

### Using in Elementor

1. Add an **HTML widget** to your page
2. Paste the shortcode:
   ```
   [color_kit_game button_url="YOUR_PRODUCT_URL"]
   ```
3. Save and preview

## Testing Outside WordPress

Open `demo.html` in your browser to test the game without WordPress. This file uses the same CSS and JavaScript as the plugin.

To customize the demo:
1. Edit the `data-button-url` attribute in `demo.html`
2. Edit the `data-button-text` attribute for custom button text

## Game Flow

1. **Steps 1-7**: Assemble front-side components
   - Female Header Pins (12P)
   - Female Header Pins (16P)
   - Male Header Pins (12P)
   - Male Header Pins (16P)
   - ePulse Feather
   - Power Switch
   - Grove Connector

2. **Board Flip**: After step 7, the board flips to show the back

3. **Steps 8-11**: Place stickers on the back
   - Sticker 1
   - Sticker 2
   - Sticker 3
   - Sticker 4

4. **Step 12**: Place the display

5. **Completion**: Display flickers on with dramatic effect

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Styling

Edit `assets/color-kit-game.css` to customize colors, sizes, and animations.

### Game Logic

Edit `assets/color-kit-game.js` to modify game behavior, component order, or animations.

## Troubleshooting

**Images not loading:**
- Check that all images are in the correct folders
- Verify file names match exactly (case-sensitive)
- Check browser console for 404 errors

**Shortcode not working:**
- Make sure the plugin is activated
- Clear WordPress cache
- Try a different page/post

**Touch not working on mobile:**
- Ensure you're testing on a real device (not just browser resize)
- Check that no other scripts are interfering with touch events

## License

GPL v2 or later

## Credits

Developed for Color Kit PCB assembly demonstration.
