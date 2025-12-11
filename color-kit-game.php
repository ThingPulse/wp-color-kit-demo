<?php
/**
 * Plugin Name: Color Kit Assembly Game
 * Plugin URI: https://yoursite.com
 * Description: An interactive drag-and-drop PCB assembly game with shortcode support
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yoursite.com
 * License: GPL v2 or later
 * Text Domain: color-kit-game
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class ColorKitGame {
    
    public function __construct() {
        add_shortcode('color_kit_game', array($this, 'render_game'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
    }
    
    private function get_translations($lang) {
        $translations = array(
            'en' => array(
                'step_text' => 'Step %d of %d: Place the %s',
                'completion_text' => 'Nice! You\'ve just built the whole board. This is exactly what you\'ll do with the real Color Kit.',
                'button_text' => 'Build it for real',
                'assembly_complete' => 'Assembly Complete!',
                'components' => array(
                    '01_FemaleHeaderPins_12P' => 'Female Header Pins (12P)',
                    '02_FemaleHeaderPins_16p' => 'Female Header Pins (16P)',
                    '03_MaleHeaderPins_12P' => 'Male Header Pins (12P)',
                    '04_MaleHeaderPins_16P' => 'Male Header Pins (16P)',
                    '05_ePulseFeather' => 'ePulse Feather',
                    '06_PowerSwitch' => 'Power Switch',
                    '07_GroveConnector' => 'Grove Connector',
                    '11_Sticker1' => 'Sticker 1',
                    '12_Sticker2' => 'Sticker 2',
                    '13_Sticker3' => 'Sticker 3',
                    '14_Sticker4' => 'Sticker 4',
                    '15_Display' => 'Display'
                )
            ),
            'de' => array(
                'step_text' => 'Schritt %d von %d: Platziere %s',
                'completion_text' => 'Toll! Du hast gerade die ganze Platine gebaut. Genau das wirst du mit dem echten Color Kit tun.',
                'button_text' => 'Jetzt das echte bauen',
                'assembly_complete' => 'Montage abgeschlossen!',
                'components' => array(
                    '01_FemaleHeaderPins_12P' => 'die Buchsenleiste (12P)',
                    '02_FemaleHeaderPins_16p' => 'die Buchsenleiste (16P)',
                    '03_MaleHeaderPins_12P' => 'die Stiftleiste (12P)',
                    '04_MaleHeaderPins_16P' => 'die Stiftleiste (16P)',
                    '05_ePulseFeather' => 'das ePulse Feather',
                    '06_PowerSwitch' => 'den Power-Schalter',
                    '07_GroveConnector' => 'den Grove-Anschluss',
                    '11_Sticker1' => 'Sticker 1',
                    '12_Sticker2' => 'Sticker 2',
                    '13_Sticker3' => 'Sticker 3',
                    '14_Sticker4' => 'Sticker 4',
                    '15_Display' => 'das Display'
                )
            )
        );
        
        return isset($translations[$lang]) ? $translations[$lang] : $translations['en'];
    }
    
    public function enqueue_assets() {
        // Only enqueue if shortcode is present
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'color_kit_game')) {
            wp_enqueue_style(
                'color-kit-game-style',
                plugin_dir_url(__FILE__) . 'assets/color-kit-game.css',
                array(),
                '1.0.4'
            );
            
            wp_enqueue_script(
                'color-kit-game-script',
                plugin_dir_url(__FILE__) . 'assets/color-kit-game.js',
                array(),
                '1.0.9',
                true
            );
        }
    }
    
    public function render_game($atts) {
        $atts = shortcode_atts(array(
            'button_url' => '#',
            'button_text' => '',
            'img_path' => plugin_dir_url(__FILE__) . 'assets/img/',
            'lang' => 'en'
        ), $atts);
        
        // Get translations
        $translations = $this->get_translations($atts['lang']);
        
        // Set button text with fallback
        if (empty($atts['button_text'])) {
            $atts['button_text'] = $translations['button_text'];
        }
        
        ob_start();
        ?>
        <div id="tp-board-game" 
             data-button-url="<?php echo esc_url($atts['button_url']); ?>" 
             data-button-text="<?php echo esc_attr($atts['button_text']); ?>" 
             data-img-path="<?php echo esc_url($atts['img_path']); ?>"
             data-lang="<?php echo esc_attr($atts['lang']); ?>"
             data-translations='<?php echo json_encode($translations, JSON_HEX_APOS | JSON_HEX_QUOT); ?>'>
          <div class="tp-game-container">
            <div class="tp-board-wrapper">
              <div class="tp-board">
                <img src="<?php echo esc_url($atts['img_path']); ?>00_ConenctorBoard.png" class="tp-board-base" alt="Connector Board">
                <img src="<?php echo esc_url($atts['img_path']); ?>01_FemaleHeaderPins_12P.png" class="tp-ghost-component" id="tp-ghost" alt="Target placement">
                <!-- Placed components will be added here -->
              </div>
            </div>
            
            <div class="tp-step-indicator">
              <span class="tp-step-text"><?php echo sprintf($translations['step_text'], 1, 12, $translations['components']['01_FemaleHeaderPins_12P']); ?></span>
            </div>
            
            <div class="tp-assembly-area">
              <div class="tp-3d-preview">
                <img src="<?php echo esc_url($atts['img_path']); ?>3d/00_ConnectorBoard.png" id="tp-3d-image" alt="3D Preview">
              </div>
              
              <div class="tp-tray">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/01_FemaleHeaderPins_12P.png" 
                   class="tp-component" 
                   data-id="01_FemaleHeaderPins_12P"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>01_FemaleHeaderPins_12P.png"
                   data-order="1"
                   alt="Female Header Pins 12P">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/02_FemaleHeaderPins_16p.png" 
                   class="tp-component tp-hidden" 
                   data-id="02_FemaleHeaderPins_16p"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>02_FemaleHeaderPins_16p.png"
                   data-order="2"
                   alt="Female Header Pins 16P">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/03_MaleHeaderPins_12P.png" 
                   class="tp-component tp-hidden" 
                   data-id="03_MaleHeaderPins_12P"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>03_MaleHeaderPins_12P.png"
                   data-order="3"
                   alt="Male Header Pins 12P">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/04_MaleHeaderPins_16P.png" 
                   class="tp-component tp-hidden" 
                   data-id="04_MaleHeaderPins_16P"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>04_MaleHeaderPins_16P.png"
                   data-order="4"
                   alt="Male Header Pins 16P">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/05_ePulseFeather.png" 
                   class="tp-component tp-hidden" 
                   data-id="05_ePulseFeather"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>05_ePulseFeather.png"
                   data-order="5"
                   alt="ePulse Feather">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/06_PowerSwitch.png" 
                   class="tp-component tp-hidden" 
                   data-id="06_PowerSwitch"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>06_PowerSwitch.png"
                   data-order="6"
                   alt="Power Switch">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/07_GroveConnector.png" 
                   class="tp-component tp-hidden" 
                   data-id="07_GroveConnector"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>07_GroveConnector.png"
                   data-order="7"
                   alt="Grove Connector">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/11_Sticker1.png" 
                   class="tp-component tp-hidden" 
                   data-id="11_Sticker1"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>11_Sticker1.png"
                   data-order="8"
                   alt="Sticker 1">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/12_Sticker2.png" 
                   class="tp-component tp-hidden" 
                   data-id="12_Sticker2"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>12_Sticker2.png"
                   data-order="9"
                   alt="Sticker 2">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/13_Sticker3.png" 
                   class="tp-component tp-hidden" 
                   data-id="13_Sticker3"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>13_Sticker3.png"
                   data-order="10"
                   alt="Sticker 3">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/14_Sticker4.png" 
                   class="tp-component tp-hidden" 
                   data-id="14_Sticker4"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>14_Sticker4.png"
                   data-order="11"
                   alt="Sticker 4">
              <img src="<?php echo esc_url($atts['img_path']); ?>pickup/15_Display.png" 
                   class="tp-component tp-hidden" 
                   data-id="15_Display"
                   data-full-src="<?php echo esc_url($atts['img_path']); ?>15_Display.png"
                   data-order="12"
                   alt="Display">
              </div>
            </div>
            
            <div class="tp-completion tp-hidden">
              <p class="tp-completion-text"><?php echo esc_html($translations['completion_text']); ?></p>
              <a href="<?php echo esc_url($atts['button_url']); ?>" class="tp-completion-btn"><?php echo esc_html($atts['button_text']); ?></a>
            </div>
          </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
new ColorKitGame();
