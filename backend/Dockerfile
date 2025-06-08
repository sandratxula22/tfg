FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    git \
    curl \
    libzip-dev \
    libpng-dev \
    jpeg-dev \
    libwebp-dev \
    freetype-dev \
    imagemagick-dev \
    supervisor \
    nodejs \
    npm \
    php82-pecl-imagick \
    && docker-php-ext-install pdo pdo_mysql zip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install bcmath \
    && docker-php-ext-install exif

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend/ .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/html/storage \
    && chown -R www-data:www-data /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]