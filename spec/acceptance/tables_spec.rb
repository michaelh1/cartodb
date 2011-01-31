require File.expand_path(File.dirname(__FILE__) + '/acceptance_helper')

feature "Tables" do

  background do
    @user = create_user
    @table = create_table :user_id => @user.id, :name => 'Twitter followers', :privacy => Table::PUBLIC,
                          :tags => 'twitter'

    login_as @user

    click_link_or_button("Twitter followers")
  end

  scenario "Toggle the privacy of a table" do
    # Toggle to private
    click_link_or_button("PUBLIC")
    page.find("span.privacy_window ul li.private a").click

    page.should have_css("p.status", :text => 'private')
    page.find("div.performing_op p.success").text.should == 'The status has been changed'

    # Toggle to public
    page.find("p.status a").click
    page.find("span.privacy_window ul li.public a").click

    page.should have_css("p.status", :text => 'public')
    page.find("div.performing_op p.success").text.should == 'The status has been changed'
  end

  scenario "Change the name from a table" do
    click_link_or_button("Twitter followers")
    page.find("form#change_name input[name='title']").set("New name")
    page.find_button('Save').click

    page.find("h2").text.should == "New name"
  end

  scenario "Add and remove tags from a table" do
    click_link_or_button("add tags")
    page.find("li.tagit-new input.tagit-input").set("tag1 ")
    page.find_link("Save").click

    page.find("div.performing_op p.success").text.should == 'Tags changed'
    page.all("span.tags p")[0].text.should == 'twitter'
    page.all("span.tags p")[1].text.should == 'tag1'

    click_link_or_button("add tags")
    page.find("li.tagit-new input.tagit-input").set("tag3 ")
    page.find_link("Save").click

    page.find("div.performing_op p.success").text.should == 'Tags changed'
    page.all("span.tags p")[0].text.should == 'twitter'
    page.all("span.tags p")[1].text.should == 'tag1'
    page.all("span.tags p")[2].text.should == 'tag3'

    click_link_or_button("add tags")
    page.find("li.tagit-choice", :text => "tag3").find("a.close").click
    page.find_link("Save").click

    page.all("span.tags p")[0].text.should == 'twitter'
    page.all("span.tags p")[1].text.should == 'tag1'
    page.all("span.tags p").size.should == 2
  end

end
