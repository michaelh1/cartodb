namespace :user do
  namespace :deletion do
    desc 'Delete a user given a username'
    task :by_username, [:username] => [:environment] do |task, args|
      raise 'Please specify the username of the user to be deleted' if args[:username].blank?

      user = ::User.find(username: args[:username])
      raise "The username '#{args[:username]}' does not correspond to any user" if user.nil?

      raise 'Deletion aborted due to bad confirmation' if !deletion_confirmed?(user)

      user.destroy
    end

    desc 'Delete a user given an email'
    task :by_email, [:email] => [:environment] do |task, args|
      raise 'Please specify the email of the user to be deleted' if args[:email].blank?

      user = ::User.find(email: args[:email])
      raise "The email '#{args[:email]}' does not correspond to any user" if user.nil?

      raise 'Deletion aborted due to bad confirmation' if !deletion_confirmed?(user)

      user.destroy
    end

    def deletion_confirmed?(user)
      puts ""
      puts "You are about to delete the following user:"
      puts "\t> username: #{user.username}"
      puts "\t> email: #{user.email}"
      puts ""
      puts "Alongside '#{user.username}', the following will be deleted:"
      puts "\t> #{user.maps.length} maps"
      puts "\t> #{user.tables.count} datasets"
      puts ""
      puts "Type in the user's username (#{user.username}) to confirm:"

      confirm = STDIN.gets.strip

      confirm == user.username
    end
  end

  namespace :change do
    desc 'Change the number of maximum layers allowed on a map'
    task :max_layers, [:username, :max_layers] => [:environment] do |task, args|
      max_layers = args[:max_layers].to_i

      raise 'Please specify the username of the user to be modified' if args[:username].blank?
      raise 'Please specify a number of layers that is a positive integer' if max_layers < 1

      user = ::User.find(username: args[:username])
      raise "The username '#{args[:username]}' does not correspond to any user" if user.nil?

      old_max_layers = user.max_layers

      user.max_layers = max_layers
      user.save

      puts "Changed the number of max layers for '#{user.username}' from #{old_max_layers} to #{max_layers}."
    end
  end

  namespace :likes do
    desc 'Clean likes for all the users of the organization'
    task :clean_org_likes, [:organization] => [:environment] do |_, args|
      raise 'Please specify the organization to be cleaned' if args[:organization].blank?
      org = Carto::Organization.find_by_name(args[:organization])
      raise "The organization '#{args[:organization]}' does not correspond to any organization" if org.nil?
      org.users.find_each do |u|
        Carto::Like.where(actor: u.id).delete_all
      end
    end
    desc 'Clean likes for a user'
    task :clean_user_likes, [:username] => [:environment] do |_, args|
      raise 'Please specify the username to be cleaned' if args[:username].blank?
      u = Carto::User.find_by_username(args[:username])
      raise "The username '#{args[:username]}' does not correspond to any user" if u.nil?
      Carto::Like.where(actor: u.id).delete_all
    end
  end
end
