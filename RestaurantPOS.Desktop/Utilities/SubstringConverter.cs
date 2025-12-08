using System;
using System.Globalization;
using System.Windows.Data;

namespace RestaurantPOS.Desktop.Utilities
{
    public class SubstringConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string text && !string.IsNullOrEmpty(text))
            {
                int length = 1;
                if (parameter != null && int.TryParse(parameter.ToString(), out int parsedLength))
                {
                    length = parsedLength;
                }

                if (text.Length > length)
                {
                    return text.Substring(0, length);
                }
                return text;
            }
            return string.Empty;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
