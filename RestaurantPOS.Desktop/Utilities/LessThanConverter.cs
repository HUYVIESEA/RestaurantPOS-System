using System;
using System.Globalization;
using System.Windows.Data;

namespace RestaurantPOS.Desktop.Utilities
{
    public class LessThanConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is int intValue && double.TryParse(parameter?.ToString(), out double doubleParam))
            {
                return intValue < doubleParam;
            }
            if (value is double dValue && double.TryParse(parameter?.ToString(), out double doubleParam2))
            {
                return dValue < doubleParam2;
            }
            return false;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
